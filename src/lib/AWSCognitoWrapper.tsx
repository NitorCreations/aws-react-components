import * as React from 'react';
import * as AWS from 'aws-sdk';
import {CognitoUser, CognitoUserAttribute, AuthenticationDetails, CognitoUserPool} from 'amazon-cognito-identity-js';
import {LoginForm} from './LoginForm';
import {DefaultLoginForm} from './DefaultLoginForm';

export namespace AWSCognitoWrapper {
    export interface Props {
        awsRegion : string;
        awsUserPoolId : string;
        awsIdentityPoolId : string;
        awsClientId : string;

        overrideLoginForm?: LoginForm <LoginForm.Props, any>;

        returnAccessToken?: (token : string) => void;
        returnAttributes?: (attributes : CognitoUserAttribute[]) => void;

    }
}

export class AWSCognitoWrapper extends React.Component < AWSCognitoWrapper.Props, {} > {

    private userPool: CognitoUserPool;

    constructor(props : AWSCognitoWrapper.Props) {
        super(props);

        AWS.config.region = props.awsRegion;

        let poolData = {
            UserPoolId: props.awsUserPoolId,
            ClientId: props.awsClientId
        };
        this.userPool = new CognitoUserPool(poolData);

        this.loginHandler = this
            .loginHandler
            .bind(this);
        this.setAwsCredentials = this
            .setAwsCredentials
            .bind(this);
        this.getSessionData = this
            .getSessionData
            .bind(this);

    }

    setAwsCredentials(token : string) {
        let loginObject = {};
        loginObject['cognito-idp.' + this.props.awsRegion + '.amazonaws.com/' + this.props.awsUserPoolId] = token;

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: this.props.awsIdentityPoolId, Logins: loginObject});
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

                    if (self.props.returnAttributes) {
                        if (cognitoUser !== null) {
                            cognitoUser.getUserAttributes((err, attributes) => {
                                if (err || typeof attributes === "undefined") {
                                    alert(err);
                                } else if (self.props.returnAttributes) {
                                    self
                                        .props
                                        .returnAttributes(attributes);
                                }
                            });
                        }
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
            },

            onFailure: function (err) {
                alert(err);
            },

            newPasswordRequired: function (userAttributes, requiredAttributes) {
                let newPassword = prompt("Enter new password");

                if (newPassword === null) {
                    alert("You should have entered a new password...");
                    return;
                }

                // the api doesn't accept this field back
                delete userAttributes.email_verified;

                cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);

            }

        });
    }

    render() {
        let LoginFormType : any = this.props.overrideLoginForm
            ? this.props.overrideLoginForm
            : DefaultLoginForm;

        if (AWS.config.credentials === null) {
            return (<LoginFormType loginHandler={this.loginHandler}/>);
        }

        return (
            <div>
                {this.props.children}
            </div>
        );
    }

}