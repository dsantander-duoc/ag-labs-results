import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const base = `${environment.apiBaseUrlAuth}/users`;

  const sampleUser: User = {
    userId: 1,
    rut: '12.345.678-9',
    username: 'jperez',
    name: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phone: '+56912345678',
    birthDate: '1990-01-15',
    address: 'Av. Principal 123',
    active: true,
    comunaId: 3,
    laboratoryId: 1,
    roleIds: [1],
  };

  const sampleUsers: User[] = [sampleUser];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll: should make GET request and return users', () => {
    service.getAll().subscribe((res) => {
      expect(res).toEqual(sampleUsers);
      expect(res.length).toBe(1);
      expect(res[0].username).toBe('jperez');
    });

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush(sampleUsers);
  });

  it('getById: should make GET request with id and return user', () => {
    service.getById(1).subscribe((res) => {
      expect(res).toEqual(sampleUser);
      expect(res.userId).toBe(1);
    });

    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(sampleUser);
  });

  it('create: should make POST request with user and return created user', () => {
    const newUser: User = {
      ...sampleUser,
      userId: 2,
      username: 'mgarcia',
    };

    service.create(newUser).subscribe((res) => {
      expect(res).toEqual(newUser);
      expect(res.userId).toBe(2);
    });

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(newUser);
  });

  it('update: should make PUT request with id and user', () => {
    const updatedUser: User = {
      ...sampleUser,
      name: 'Juan Carlos',
    };

    service.update(1, updatedUser).subscribe((res) => {
      expect(res).toEqual(updatedUser);
      expect(res.name).toBe('Juan Carlos');
    });

    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedUser);
    req.flush(updatedUser);
  });

  it('delete: should make DELETE request with id', () => {
    service.delete(1).subscribe((res) => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getAll: should propagate HTTP error', () => {
    const status = 500;
    const statusText = 'Server Error';

    service.getAll().subscribe({
      next: () => fail('Should fail'),
      error: (err) => {
        expect(err.status).toBe(status);
      },
    });

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'Server error' }, { status, statusText });
  });

  it('getById: should propagate HTTP error', () => {
    const status = 404;
    const statusText = 'Not Found';

    service.getById(999).subscribe({
      next: () => fail('Should fail'),
      error: (err) => {
        expect(err.status).toBe(status);
      },
    });

    const req = httpMock.expectOne(`${base}/999`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'User not found' }, { status, statusText });
  });
});
