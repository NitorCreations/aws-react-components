import { Component } from 'react';


export namespace ResetPasswordForm {
    export interface Props {
        returnNewPassword: (password: string) => void;
        error: string;
    }
}

export abstract class ResetPasswordForm<P extends ResetPasswordForm.Props, S extends {}> extends Component<P, S> {

}