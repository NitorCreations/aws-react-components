import * as React from 'react';
import * as AWS from 'aws-sdk';
import {CognitoUser, CognitoUserAttribute, AuthenticationDetails, CognitoUserPool} from 'amazon-cognito-identity-js';
import {LoginForm} from './LoginForm';
import {DefaultLoginForm} from './DefaultLoginForm';
import {ResetPasswordForm} from './ResetPasswordForm';
import {DefaultResetPasswordForm} from './DefaultResetPasswordForm';

export namespace AWSCognitoWrapper {
    export interface Props extends React.Props<AWSCognitoWrapper> {
        awsRegion : string;
        awsUserPoolId : string;
        awsIdentityPoolId : string;
        awsClientId : string;

        overrideLoginForm?: LoginForm <LoginForm.Props, any>;
        overrideResetPassword?: ResetPasswordForm<ResetPasswordForm.Props, any>;

        returnAccessToken?: (token : string) => void;
        returnAttributes?: (attributes : CognitoUserAttribute[]) => void;

    }

    export interface State {
        // These are for forced password change
        requiredPasswordChange: boolean,
        error?: string,
        userAttributes?: CognitoUserAttribute[],
        self?: any,
        cognitoUser?: CognitoUser,
        // This is passed to children
        awsUserAttributes?: CognitoUserAttribute[]
    }
}

export class AWSCognitoWrapper extends React.Component < AWSCognitoWrapper.Props, AWSCognitoWrapper.State > {

    private userPool: CognitoUserPool;

    constructor(props : AWSCognitoWrapper.Props) {
        super(props);

        this.state = {
            requiredPasswordChange: false
        };
        
        AWS.config.region = props.awsRegion;

        let poolData = {
            UserPoolId: props.awsUserPoolId,
            ClientId: props.awsClientId
        };
        this.userPool = new CognitoUserPool(poolData);

        this.loginHandler = this.loginHandler.bind(this);
        this.setAwsCredentials = this.setAwsCredentials.bind(this);
        this.getSessionData = this.getSessionData.bind(this);
        this.submitForcedNewPassword = this.submitForcedNewPassword.bind(this);


    }

    setAwsCredentials(token : string) {
        let loginObject = {};
        loginObject['cognito-idp.' + this.props.awsRegion + '.amazonaws.com/' + this.props.awsUserPoolId] = token;

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: this.props.awsIdentityPoolId, Logins: loginObject});

        let creds = AWS.config.credentials as AWS.Credentials;

        if(creds.needsRefresh()) {
            creds.refresh((error) => {
                if (error) {
                    console.error(error);
                } else {
                    console.log('Successfully logged!');
                }
            });
        }

        

    }

    componentDidMount() {
        this.getSessionData();
    }

    getSessionData() {
        let cognitoUser = this
            .userPool
            .getCurrentUser();

        let self = this;

        if (cognitoUser !== null) {
            cognitoUser.getSession((err : any, session : any) => {
                if (err !== null) {
                    alert(err);
                }
                if (session.isValid()) {

                    self.setAwsCredentials(session.getIdToken().getJwtToken());

                    if (self.props.returnAccessToken) {
                        self
                            .props
                            .returnAccessToken(session.getIdToken().getJwtToken());
                    }

                    if (cognitoUser !== null) {
                        cognitoUser.getUserAttributes((err, attributes) => {
                            if (err || typeof attributes === "undefined") {
                                alert(err);
                                return;
                            } else {
                                if (self.props.returnAttributes) {
                                    self
                                        .props
                                        .returnAttributes(attributes);
                                }

                                self.setState({
                                    awsUserAttributes: attributes
                                });
                            }
                            
                        });
                    }                    
                }
            });
        }
    }

    loginHandler(username : string, password : string) {
        let authenticationData = {
            Username: username,
            Password: password
        };
        let authenticationDetails = new AuthenticationDetails(authenticationData);
        let userData = {
            Username: username,
            Pool: this.userPool
        };

        let self = this;

        let cognitoUser = new CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                self.setAwsCredentials(result.getIdToken().getJwtToken());
                if (self.props.returnAccessToken) {
                    self
                        .props
                        .returnAccessToken(result.getIdToken().getJwtToken());
                }

                self.getSessionData();

                self.setState({
                    requiredPasswordChange: false
            });

            },

            onFailure: function (err) {
                self.setState({
                    error: err.message
                });
            },

            newPasswordRequired: function (userAttributes, requiredAttributes) {
                // the api doesn't accept these fields back
                delete userAttributes.email_verified;
                delete userAttributes.phone_number_verified;

                self.setState({
                    requiredPasswordChange: true,
                    cognitoUser: cognitoUser,
                    userAttributes: userAttributes,
                    self: this
                });
            }

        });
    }

    submitForcedNewPassword(newPassword: string) {
        if(this.state.cognitoUser) {
            this.state.cognitoUser.
                completeNewPasswordChallenge(newPassword, 
                    this.state.userAttributes, 
                    this.state.self);

        } else {
            alert("Something went badly wrong!");
        }
        
    }

    render() {


        if (this.state.requiredPasswordChange) {
            let ResetPasswordType: any = this.props.overrideResetPassword ? this.props.overrideResetPassword : DefaultResetPasswordForm;
            return (
                <ResetPasswordType returnNewPassword={this.submitForcedNewPassword} error={this.state.error} />
            );
        }

        if (AWS.config.credentials === null) {
            let LoginFormType : any = this.props.overrideLoginForm
                ? this.props.overrideLoginForm
                : DefaultLoginForm;

            return (<LoginFormType loginHandler={this.loginHandler} error={this.state.error}/>);
        }

        let self = this;
        const childrenWithProps = React.Children.map(this.props.children, 
            (child, index) => {
                if(React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        awsUserAttributes: self.state.awsUserAttributes,
                        AWS: AWS
                    });
                }
                return;
            }
        );

        return (
            <div>
                {childrenWithProps}
            </div>
        );
    }

}