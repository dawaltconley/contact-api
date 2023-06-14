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

```bash
aws cloudformation package \
  --template-file $TEMPLATE \
  --s3-bucket $BUCKET \
  --output-template-file $OUTPUT
aws cloudformation deploy \
  --template-file $OUTPUT \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM
```

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
