import * as React from 'react';
import {VerifyPasswordResetForm} from './VerifyPasswordResetForm';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.SFC<ErrorMessageProps> = (props) => {
    return <p className="errorMessage">Error: {props.message}</p>;
}

export namespace DefaultVerifyPasswordResetForm {
    export interface State {
        newPassword: string;
        verificationToken: string;
        error: string|null;
    }
}

export class DefaultVerifyPasswordResetForm extends VerifyPasswordResetForm<VerifyPasswordResetForm.Props, DefaultVerifyPasswordResetForm.State> {
    constructor(){
        super();

        this.state = {
            newPassword: "",
            verificationToken: "",
            error: null
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleNewPassword = this.handleNewPassword.bind(this);
        this.handleVerificationToken = this.handleVerificationToken.bind(this);
    }

    handleNewPassword(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({newPassword: e.target.value});
    }

    handleVerificationToken(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({verificationToken: e.target.value});
    }

    handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if(this.state.newPassword.length < 1) {
            this.setState({error: "New password must not be empty"});
            return;
        }
        if(this.state.verificationToken.length < 1) {
            this.setState({error: "Verification token must not be empty"});
            return;
        }

        this.props.returnNewPassword(this.state.verificationToken, this.state.newPassword);
    }

    render() {
        return (
            <div>
                {this.props.error && <ErrorMessage message={this.props.error} />}
                {this.state.error && <ErrorMessage message={this.state.error} />}

                <h4>Please enter the password reset code and the new password.</h4>
                <form onSubmit={this.handleSubmit}>
                    <input type="text" name="verificationToken" onChange={this.handleVerificationToken} placeholder="Password reset code"/>
                    <input type="password" name="newPassword" onChange={this.handleNewPassword} placeholder="New Password"/>
                    <input type="submit" />
                </form>
            </div>

        );
    }
}
