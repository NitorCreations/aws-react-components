import { Component } from 'react';


export namespace VerifyPasswordResetForm {
    export interface Props {
        returnNewPassword: (verificationToken: string, password: string) => void;
        error: string;
    }
}

export abstract class VerifyPasswordResetForm<P extends VerifyPasswordResetForm.Props, S extends {}> extends Component<P, S> {

}