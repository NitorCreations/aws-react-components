import * as React from 'react';
import {ResetPasswordForm} from './ResetPasswordForm';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.SFC<ErrorMessageProps> = (props) => {
    return <p className="errorMessage">Error: {props.message}</p>;
}

export namespace DefaultResetPasswordForm {
    export interface State {
        password1: string;
        password2: string;
    }
}

export class DefaultResetPasswordForm extends ResetPasswordForm<ResetPasswordForm.Props, DefaultResetPasswordForm.State> {
    constructor(){
        super();

        this.state = {
            password1: "",
            password2: "",
        }

        this.handlePassword1 = this.handlePassword1.bind(this);
        this.handlePassword2 = this.handlePassword2.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handlePassword1(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({password1: e.target.value});
    }

    handlePassword2(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({password2: e.target.value});
    }

    handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        this.props.returnNewPassword(this.state.password1);
    }

    render() {
        return (
            <div>
                {this.props.error && <ErrorMessage message={this.props.error} />}

                <h4>Please enter a new password</h4>
                <form onSubmit={this.handleSubmit}>
                    <input type="password" name="password1" onChange={this.handlePassword1} placeholder="New password"/>
                    <input type="password" name="password2" onChange={this.handlePassword2} placeholder="Confirm new password"/>
                    <input type="submit" />
                </form>
            </div>

        );
    }
}