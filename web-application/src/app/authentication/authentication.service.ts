import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import {Observable} from "rxjs/Observable";
import {Response} from '@angular/http';
import 'rxjs/add/operator/catch.js'
import 'rxjs/Rx';

@Injectable()
export class AuthenticationService {
  private BASE_URL: string = 'http://localhost:5000/api/auth';

  private headers: Headers = new Headers({'Content-Type': 'application/json'});

  public token : String;

  constructor(private http: Http) {
    // set token if saved in local storage
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('[AuthService] init: ', currentUser);
    this.token = currentUser && currentUser.token;
  }

  /**
   * It calls the api passing email and password.
   * If the credentials are valid it stores the received token in localStorage and return true.
   * If they are invalid, it returns false.
   * @param email
   * @param password
   * @returns {Subscription}
     */
  login(email : String, password : String): Observable<Object> {
    let url: string = `${this.BASE_URL}/login`;
    return this.http.post(url, {email: email, password: password})
      .map(
        (response: Response) => {
          // login successful
          let body = response.json();
          // store the token in localStorage
          this.token = body.jwtToken;
          localStorage.setItem('currentUser', JSON.stringify({
            user: body.user,
            jwtToken: body.jwtToken
          }));
          return body.user;
        }
      )
      .catch(
        (error : any) => {
          console.log('An error occured in authentication service. ', error);
          return Observable.of(false);
        }
      )
  }

  register(name: String, surname: String, email : String, password : String): Observable<Object> {
    let url: string = `${this.BASE_URL}/register`;
    return this.http.post(url, {name: name, surname: surname, email: email, password: password})
      .map(
        (response: Response) => {
          // login successful
          let body = response.json();
          // store the token in localStorage
          this.token = body.jwtToken;
          localStorage.setItem('currentUser', JSON.stringify({
            user: body.user,
            jwtToken: body.jwtToken
          }));
          return body.user;
        }
      )
      .catch(
        (error : any) => {
          console.log('An error occured in authentication service. ', error);
          return Observable.of(false);
        }
      )
  }

  loginFB(): Observable <Object> {
    let url: string = `${this.BASE_URL}/register/facebook`;
    return this.http.get(url).map((response: Response) => {
        // login successful
        let body = response.json();
        // store the token in localStorage
        this.token = body.jwtToken;
        localStorage.setItem('currentUser', JSON.stringify({
          user: body.user,
          jwtToken: body.jwtToken
        }));
        return body.user;
    })
      .catch(
        (error : any) => {
          console.log('An error occured in authentication service. ', error);
          return Observable.of(false);
        })
  }

  loginGoogle(): Observable <Object> {
    let url: string = `${this.BASE_URL}/register/google`;
    return this.http.get(url).map((response: Response) => {
      // login successful
      let body = response.json();
      // store the token in localStorage
      this.token = body.jwtToken;
      localStorage.setItem('currentUser', JSON.stringify({
        user: body.user,
        jwtToken: body.jwtToken
      }));
      return body.user;
    })
      .catch(
        (error : any) => {
          console.log('An error occured in authentication service. ', error);
          return Observable.of(false);
        })
  }

  /**
   * It clears the localStorage removin the currentUser.
   */
  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    localStorage.removeItem('currentUser');
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('Logging out...');
    console.log('[AuthService] init: ', currentUser);
  }
}
