import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable }                    from '@angular/core';
import { LoggedInUser }                  from '@app/shared/models/LoggedInUser';
import { User }                          from '@app/shared/models/User';
import { UserLoginHistory }              from '@app/shared/models/UserLoginHistory';
import { BaseService }                   from '@app/shared/services/base.service';
import { Observable, throwError }        from 'rxjs';
import { catchError }                    from 'rxjs/operators';
import { environment }                   from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersUrl = environment.baseUrl + "/Users";
  private defaultUserRolesUrl = environment.baseUrl + "/DefaultUserRoles";
  private projectUsersUrl = environment.baseUrl + "/ProjectUsers";
  private projectUserRolesUrl = environment.baseUrl + "/ProjectUserRoles";
  private selectedUserId: number;

  private static _loggedInUser: LoggedInUser;

  static get loggedInUser(): LoggedInUser {
    if (!this._loggedInUser) {
      this._loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    }
    return this._loggedInUser;
  }

  getUsersUrl(): string {
    return this.usersUrl;
  }

  getDefaultUserRolesUrl(): string {
    return this.defaultUserRolesUrl;
  }

  getProjectUsersUrl(): string {
    return this.projectUsersUrl;
  }

  getProjectUserRolesUrl(): string {
    return this.projectUserRolesUrl;
  }

  setSelectedUserId(id: number): void {
    this.selectedUserId = id;
  }

  getSelectedUserId(): number {
    return this.selectedUserId;
  }

  setLoggedInUser(loggedUser: LoggedInUser) {
    UserService._loggedInUser = loggedUser;
  }

  getLoggedInUser(): LoggedInUser {
    return UserService.loggedInUser;
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}/GetUserById?id=${id}`, this.baseService.getHttpOptions())
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error.message);
        })
      )
  }

  getUserByUsernamePassword(username: string, password: string): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}/GetUserByUsernamePassword?username=${username}&password=${password}`, this.baseService.getHttpOptions())
      .pipe(
        catchError((error: HttpErrorResponse) => {
            return throwError(error.message);
        })
    )
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}/GetUserByUsername?username=${username}`)

  }

  checkIfUserExistsByUsernamePassword(username: string, password: string): Observable<number> {
    return this.http.get<number>(`${this.usersUrl}/CheckIfUserExistsByUsernamePassword?username=${username}&password=${password}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error.message);
        })
      )
  }

  checkCurrentPassword(id: number, password: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.usersUrl}/CheckCurrentPassword?id=${id}&password=${password}`, this.baseService.getHttpOptions())
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error.message);
        })
      )
  }

  checkNewPasswordFromPreviousPasswords(id: number, password: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.usersUrl}/checkNewPasswordFromPreviousPasswords?id=${id}&password=${password}`, this.baseService.getHttpOptions())
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error.message);
        })
      )
  }

  updatePassword(id: number, password: string): Observable<any> {
    return this.http.put<User>(`${this.usersUrl}/UpdatePassword?id=${id}&password=${password}`, id, this.baseService.getHttpOptions())
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error.message);
        })
      )
  }

  clearPassword(id: number): Observable<any> {
    return this.http.put<User>(`${this.usersUrl}/ClearPassword?id=${id}`, id, this.baseService.getHttpOptions())
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error.message);
        })
      )
  }

  logUserLogin(userLoginHistory: UserLoginHistory): Observable<UserLoginHistory> {
    return this.http.post<UserLoginHistory>(this.usersUrl + '/LogUserLogin', userLoginHistory, this.baseService.getHttpOptions())
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error.message);
        })
      )
  }

  generateLoginToken(): Observable<any> {
    return this.http.post(this.usersUrl + '/GenerateLoginToken',"", this.baseService.getHttpOptions())
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error.message);
        })
      )
  }

  getUserPic(username: string): Observable<any> {
    return this.http.get("https://graph.microsoft.com/v1.0/users/" + username + "/photo/$value", this.baseService.getHttpOptions())
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error.message);
        })
      )
  }

  constructor(private http: HttpClient, private baseService: BaseService) {}
}
