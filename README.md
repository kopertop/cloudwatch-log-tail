# cloudwatch-log-tail
Tail AWS Cloudwatch Logs

Usage: node index.js <name>
Where `<name>` is the name of your CloudWatch Lambda log.
You can find them in your CloudWatch console Logs area.
They should start with ` /aws/lambda/xxx` and `<name>` is the `xxx` part.

Used for tailing logs from AWS Lambda commands.
`tail` is a *nix shell command that is used output the updates to the file of interest unitl the command is stopped.

This uses the aws-sdk and you may need your AWS account credentials stored according to your platform.
For OSX one way is in the file `~/.aws/credentials` which would look something like the following

    [default]
    region = us-east-1
    aws_access_key_id = xxxx
    aws_secret_access_key = xxxx

