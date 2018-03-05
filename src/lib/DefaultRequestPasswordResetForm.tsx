import * as React from 'react';
import {RequestPasswordResetForm} from './RequestPasswordResetForm';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.SFC<ErrorMessageProps> = (props) => {
    return <p className="errorMessage">Error: {props.message}</p>;
}

export namespace DefaultRequestPasswordResetForm {
    export interface State {
        email: string;
        error: string|null;
    }
}

export class DefaultRequestPasswordResetForm extends RequestPasswordResetForm<RequestPasswordResetForm.Props, DefaultRequestPasswordResetForm.State> {
    constructor(){
        super();

        this.state = {
            email: "",
            error: null
        }

        this.handleEmail = this.handleEmail.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleEmail(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({email: e.target.value});
    }

    handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if(this.state.email.length < 1) {
            this.setState({error: "Email must not be empty"});
            return;
        }

        this.props.returnEmail(this.state.email);
    }

    render() {
        return (
            <div>
                {this.props.error && <ErrorMessage message={this.props.error} />}
                {this.state.error && <ErrorMessage message={this.state.error} />}

                <h4>Please enter email and you will receive the password reset code via email.</h4>
                <form onSubmit={this.handleSubmit}>
                    <input type="email" name="email" onChange={this.handleEmail} placeholder="Email"/>
                    <input type="submit" />
                </form>
            </div>

        );
    }
}
