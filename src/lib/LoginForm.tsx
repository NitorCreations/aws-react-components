import { Component } from 'react';

export namespace LoginForm {
    export interface Props {
        loginHandler: (username: string, password: string) => void;
    }
}

export abstract class LoginForm<P extends LoginForm.Props, S extends {}> extends Component<P, S> {

}