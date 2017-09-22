import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {UserModel} from "./sqlite/user.model";
import {AuthGuard} from "./auth-guard";

@Injectable()
export class AuthOffline implements AuthGuard {

    private _user = null;
    private _userSubject = new BehaviorSubject(null);
    private userKey = 'userId';

    constructor(public userModel: UserModel,
                public storage: Storage) {
    }

    userSubject(): BehaviorSubject<Object> {
        return this._userSubject;
    }

    user(): Promise<Object> {
        return this.storage.get(this.userKey)
            .then(id => {
                return this.userModel.find(id);
            })
            .then(user => {
                this._user = user;
                this._userSubject.next(this._user);
                return user;
            });
    }

    check(): Promise<boolean> {
        return this.user().then(user => {
            return user !== null;
        });
    }

    login({email, password}): Promise<Object> {
        return this.userModel.findByField('email', email)
            .then((resultset) => {
                if (!resultset.rows.length) {
                    return Promise.reject("User not found");
                }
                this._user = resultset.rows.item(0);
                this._user.subscription_valid = true;
                this._userSubject.next(this._user);
                return this._user;
            });
    }

    logout(): Promise<any> {
        this._user = null;
        this._userSubject.next(null);
        return Promise.resolve(null);
    }

}
