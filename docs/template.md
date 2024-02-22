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

### ApiDomain

Base domain where the api is hosted. Used to create an API Gateway custom domain name for this deployment.

- Type: String
- Default: ""

### ApiSubdomain

Subdomain where the api is hosted. Used to create an API Gateway custom domain name for this deployment.

- Type: String
- Default: api

### ApiBasePath

Base path of the custom domain where the API will be hosted.

- Type: String
- Default: ""

### CertificateArn

Certificate Manager ARN for the ApiDomain certificate. Required to use a custom domain.

- Type: String
- Default: ""

### Route53Dns

Whether this domain uses Route53 for its DNS

- Type: String
- Default: true
- AllowedValues:
  - true
  - false

### AllowOrigin

Passed directly to Access-Control-Allow-Origin header in the CORS configuration.

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

- Type: AWS::ApiGatewayV2::DomainName
- Condition: HasCustomApiDomain

### CustomDomainMapping

- Type: AWS::ApiGatewayV2::ApiMapping
- Condition: HasCustomApiDomain

### RecordSetGroup

- Type: AWS::Route53::RecordSetGroup
- Condition: CreateRecordSetGroup

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

- Condition: HasCustomApiDomain

### ApiId

API Gateway ID

### ApiRootResourceId

Root resource ID for API Gateway