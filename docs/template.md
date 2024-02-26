# template.yaml

SAM template for handling contact form submissions.


## Required Parameters

### Email

Email address to receive contact notifications.

- Type: String

## Optional Parameters

### Required

List of form field names to require in addition to 'subject' and 'message', which are always required. The function will return a 400 error if any of these are missing.

- Type: CommaDelimitedList
- Default: email

### Honeypot

List of honeypot form field names. These will cause the function to quietly abort.

- Type: CommaDelimitedList
- Default: ""

### AllowOrigin

Passed directly to Access-Control-Allow-Origin header in the CORS configuration.

- Type: String
- Default: ""

### ApiDomain

Custom domain where the api is hosted. Used to create an API Gateway custom domain name for this deployment.

- Type: String
- Default: ""

### ApiBasePath

Base path of the custom domain where the API will be hosted.

- Type: String
- Default: ""

### CertificateArn

Certificate Manager ARN for the ApiDomain certificate. If supplied with ApiDomain, will attempt to create a new custom domain using the two.

- Type: String
- Default: ""

### HostedZoneId

If provided, creates a record set group connecting the custom domain to a Route53 zone.

- Type: String
- Default: ""

### HostedZoneName

Can provide this as an alternative to HostedZoneId

- Type: String
- Default: ""

### ApplicationLogLevel

- Type: String
- AllowedValues:
  - TRACE
  - DEBUG
  - INFO
  - WARN
  - ERROR
  - FATAL
- Default: INFO

### SystemLogLevel

- Type: String
- AllowedValues:
  - DEBUG
  - INFO
  - WARN
- Default: WARN

### LogFormat

- Type: String
- AllowedValues:
  - Text
  - JSON
- Default: Text

## Resources

### CustomDomain

- Type: AWS::CloudFormation::Stack
- Condition: CreateCustomDomain
- DependsOn: ContactApi

### CustomDomainMapping

- Type: AWS::ApiGatewayV2::ApiMapping
- Condition: HasCustomDomain
- DependsOn: ContactApiProdStage

### ContactApi

- Type: AWS::Serverless::Api

### ContactFunction

- Type: AWS::Serverless::Function
- Metadata: [object Object]

### ContactTopic

- Type: AWS::SNS::Topic

## Outputs

### ContactApi

API Gateway endpoint URL

### CustomDomainApi

Custom domain API endpoint

- Condition: HasCustomDomain

### ApiId

API Gateway ID

### ApiRootResourceId

Root resource ID for API Gateway