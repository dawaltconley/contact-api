# AWS Contact Api

A serverless application for handling contact form requests.

## Template

This project uses AWS CloudFormation templates by way of the Serverless 
Application Model (SAM). Refer to the [template 
documentation](https://github.com/dawaltconley/contact-api/blob/main/docs/template.md)
for a complete list of template parameters, resources, and outputs.

## Usage

This project can be installed and deployed in a number of ways.

### As a nested CloudFormation template

The npm distribution packages the build artifacts from `sam build` for use in a 
regular CloudFormation stack. Install these and then reference them in your 
CloudFormation template.

```
npm install -D @dawaltconley/contact-api
```

```yaml
# ...

Resources:
  ContactFormApi:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: 
      ./node_modules/@dawaltconley/contact-api/dist/build/template.yaml
      Parameters:
        Email: 'name@example.com'
        Honeypot: 'foo,bar'
        AllowOrigin: '*'

#...
```

You can then package and deploy like you would with any nested template. 
This requires the `CAPABILITY_IAM` and `CAPABILITY_AUTO_EXPAND` 
capabilities.

```bash
aws cloudformation package \
  --template-file $TEMPLATE \
  --s3-bucket $BUCKET \
  --output-template-file $OUTPUT
aws cloudformation deploy \
  --template-file $OUTPUT \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND
```

### As a source sub-template

The npm distribution also includes the original `template.yaml` and the
`contact-form` TypeScript source, in case you'd rather build the Lambda
yourself (e.g. to customize the esbuild target, runtime, or bundling) instead
of using the prebuilt artifacts.

```
npm install -D @dawaltconley/contact-api
```

```yaml
# ...

Resources:
  ContactFormApi:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: ./node_modules/@dawaltconley/contact-api/template.yaml
      Parameters:
        Email: 'name@example.com'
        Honeypot: 'foo,bar'
        AllowOrigin: '*'

#...
```

Run `sam build` from your own project; SAM's esbuild builder will install
`contact-form`'s dependencies and bundle `app.ts` itself.

### Attaching to an existing API Gateway

By default, nesting this template creates its own `AWS::Serverless::Api`.
If you'd rather attach the contact form's routes to an API Gateway you
already own elsewhere in your template — SAM's `AWS::Serverless::Api` or a
plain `AWS::ApiGateway::RestApi`, either works the same way — set
`CreateApi: 'false'`. This skips creating an API or any API Gateway
integration, and just creates the Lambda function, exposing its ARN as the
`FunctionArn` output.

```yaml
Resources:
  ContactFormApi:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: ./node_modules/@dawaltconley/contact-api/dist/build/template.yaml
      Parameters:
        Email: 'name@example.com'
        CreateApi: 'false'
```

You then wire it up yourself, in the same template as your API resource
(referred to as `YourApi` below):

```yaml
  ContactResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref YourApi
      ParentId: !GetAtt YourApi.RootResourceId
      PathPart: contact

  ContactGetMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref YourApi
      ResourceId: !Ref ContactResource
      HttpMethod: GET
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub
          - 'arn:${AWS::Partition}:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${FunctionArn}/invocations'
          - FunctionArn: !GetAtt ContactFormApi.Outputs.FunctionArn

  ContactPostMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref YourApi
      ResourceId: !Ref ContactResource
      HttpMethod: POST
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub
          - 'arn:${AWS::Partition}:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${FunctionArn}/invocations'
          - FunctionArn: !GetAtt ContactFormApi.Outputs.FunctionArn

  ContactInvokePermission:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName: !GetAtt ContactFormApi.Outputs.FunctionArn
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub 'arn:${AWS::Partition}:execute-api:${AWS::Region}:${AWS::AccountId}:${YourApi}/*/*/contact'
```

This works whether `YourApi` is an `AWS::Serverless::Api` or a plain
`AWS::ApiGateway::RestApi` — both expose a `RootResourceId` via `GetAtt` and
a REST API ID via `Ref`. It's deliberately *not* done with SAM's `Events:
Api` sugar: that property [can't reference an `AWS::Serverless::Api` defined
in another
template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-property-function-api.html#sam-function-api-restapiid),
so attaching routes to a Lambda from a separate nested stack has to be done
with plain `AWS::ApiGateway::Resource`/`Method` resources instead, in your
own template.

One caveat: if `YourApi` already has an `AWS::ApiGateway::Deployment`,
adding these `Method`s won't retroactively appear in a deployment that
already exists. Either redeploy explicitly, or give your `Deployment`
resource a `DependsOn` for `ContactGetMethod`/`ContactPostMethod` so it's
recreated whenever they change.

Another caveat: SAM always generates a `Body`/`DefinitionBody` for
`AWS::Serverless::Api`, even implicit ones. By default, API Gateway imports
that Body in `overwrite` mode, which replaces the API's *entire* resource
graph on every update — meaning the next time you change one of your own
routes (changing the Body), `ContactResource`/`ContactGetMethod`/
`ContactPostMethod` can get silently deleted, even though CloudFormation
still thinks they exist. Add `Mode: merge` to `YourApi`'s properties (passed
straight through to the underlying `AWS::ApiGateway::RestApi` by both
`AWS::Serverless::Api` and `AWS::ApiGateway::RestApi`) to make API Gateway
preserve resources that aren't in the Body. The tradeoff: CloudFormation
also won't auto-remove any of *your own* routes if you delete them from the
Body later — you'd need to clean those up manually. cfn-lint's `W3660`
check doesn't look at `Mode` at all, so it'll keep warning about this
combination even after adding it; if you've accepted the tradeoff, suppress
it for that resource the same way this project's own `template.yaml`
suppresses other checks, via `Metadata: cfn-lint: config: ignore_checks`.

### As a standalone project

If you have
[SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) 
installed, you can deploy directly from the repository.

```
git clone https://github.com/dawaltconley/contact-api
cd contact-api
sam build
sam deploy --guided
```
