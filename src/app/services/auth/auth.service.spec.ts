import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const base = `${environment.apiBaseUrl}/auth`;
  const LS_USER_KEY = 'auth.user';

  const userMock: User = {
    userId: 41,
    rut: '20.326.358-9',
    username: 'dsantander',
    name: 'Daniel',
    lastName: 'Santander',
    email: 'daniel.santander@example.com',
    phone: '+56912345678',
    birthDate: '1990-05-20',
    address: 'Av. Apoquindo 1234, Las Condes',
    active: true,
    comunaId: 12,
    laboratoryId: 3,
    roleIds: [1],
  };

  let setItemSpy: jasmine.Spy;
  let getItemSpy: jasmine.Spy;
  let removeItemSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    setItemSpy = spyOn(window.localStorage, 'setItem').and.callFake(() => {});
    getItemSpy = spyOn(window.localStorage, 'getItem').and.callFake(
      (key: string) => {
        return key === LS_USER_KEY ? JSON.stringify(userMock) : null;
      }
    );
    removeItemSpy = spyOn(window.localStorage, 'removeItem').and.callFake(
      () => {}
    );
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login: should POST /auth/login, save user in localStorage and return user', () => {
    service.login('daniel.santander@example.com', 'secret').subscribe((u) => {
      expect(u).toEqual(userMock);
      expect(setItemSpy).toHaveBeenCalledWith(
        LS_USER_KEY,
        JSON.stringify(userMock)
      );
    });

    const req = httpMock.expectOne(`${base}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'daniel.santander@example.com',
      password: 'secret',
    });

    req.flush(userMock);
  });

  it('login: should map any error to generic "Credenciales inválidas"', (done) => {
    service.login('bad@example.com', 'wrong').subscribe({
      next: () => fail('expected error'),
      error: (err: Error) => {
        expect(err.message).toBe('Credenciales inválidas');
        expect(setItemSpy).not.toHaveBeenCalled();
        done();
      },
    });

    const req = httpMock.expectOne(`${base}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(
      { error: 'whatever' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  it('getUser: should return user from localStorage', () => {
    const u = service.getUser();
    expect(getItemSpy).toHaveBeenCalledWith(LS_USER_KEY);
    expect(u?.userId).toBe(41);
  });

  it('isLoggedIn: should be true when user is in localStorage', () => {
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('logout: should remove user from localStorage', () => {
    service.logout();
    expect(removeItemSpy).toHaveBeenCalledWith(LS_USER_KEY);
  });
});
