# AWS React components


This project contains a collection of React components for faster development with AWS.


## Props

```
awsRegion: string
awsUserPoolId: string
awsIdentityPoolId: string
awsClientId: string

overrideLoginFrom?: LoginForm<LoginForm.props, any>
overrideResetPassword?: ResetPasswordForm<ResetPasswordForm.Props, any>

returnAccessToken?: (token: string) => void
returnAttributes?: (attributes: CognituUserAttribute[]) => void
returnUserSession?: (session: CognitoUserSession) => void
```

## Props passed to children

```
awsUserAttributes: CognituUserAttribute[]
AWS: {}
```


## Usage example

Children that want to access AWS services need to use the AWS object passed in as a prop.


```
const MyS3FileUploader = props => {
    const fileHandler = (e) => {
        let s3 = new props.AWS.S3();
        let reader = new FileReader();

        let file = e.target.files[0];

        reader.onload = e => {
             s3.putObject({
                Bucket: "myBucket",
                Key: file.name,
                ContentLength: file.size,
                ContentType: file.type,
                Body: e.target.result
            }, (err, data) => {
                if(err != null) {
                    alert(err);
                }

                console.log(data);

            });
        };

        reader.readAsArrayBuffer(file);
    }

    return (
        <input type="file" onChange={fileHandler} />
    )
}



export const Page = props => (
    <AWSCognitoWrapper
        awsRegion="<region>"
        awsUserPoolId="<userpoolid>"
        awsIdentityPoolId="<idpoolid>"
        awsClientId="<clientid>">

        <MyS3FileUploader />

    </AWSCognitoWrapper>)
```