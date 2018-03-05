import { Component } from 'react';


export namespace RequestPasswordResetForm {
    export interface Props {
        returnEmail: (email: string) => void;
        error: string;
    }
}

export abstract class RequestPasswordResetForm<P extends RequestPasswordResetForm.Props, S extends {}> extends Component<P, S> {

}