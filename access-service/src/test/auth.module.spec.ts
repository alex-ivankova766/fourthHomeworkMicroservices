import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { Test } from '@nestjs/testing';
import { InitialService } from '../auth/initial/initial.service';
import { VkoauthService } from '../auth/vkoauth/vkoauth.service';
import { GoogleService } from '../auth/googleoauth/google.service';
import { TokensService } from '../auth/tokens/tokens.service';

const moduleMocker = new ModuleMocker(global);

describe('Auth module', () => {
  let authController: AuthController;
  let authService: AuthService;
  let initService: InitialService;
  let vkService: VkoauthService;
  let tokenService: TokensService;
  let googleService: GoogleService;

  const mockAuthService = {
    login: jest.fn(() => {
      return 'login work';
    }),
    registration: jest.fn(() => {
      return 'registration work';
    }),
    logout: jest.fn(() => {
      return 'logout work';
    }),
  };
  const mockInitService = {
    initial: jest.fn(() => {
      return 'init work';
    }),
  };
  const mockVkService = {
    loginVk: jest.fn(() => {
      return 'login vk work';
    }),
  };
  const mockGoogleService = {
    googleLogin: jest.fn(() => {
      return 'googleLogin work';
    }),
  };
  const mockTokenService = {
    refresh: jest.fn(() => {
      return 'refresh work';
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: InitialService,
          useValue: mockInitService,
        },
        {
          provide: VkoauthService,
          useValue: mockVkService,
        },
        {
          provide: GoogleService,
          useValue: mockGoogleService,
        },
        {
          provide: TokensService,
          useValue: mockTokenService,
        },
      ],
    })
      .useMocker((token) => {
        const results = ['test1', 'test2'];
        if (token === AuthService) {
          return { findAll: jest.fn().mockResolvedValue(results) };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    authService = moduleRef.get(AuthService);
    initService = moduleRef.get(InitialService);
    vkService = moduleRef.get(VkoauthService);
    googleService = moduleRef.get(GoogleService);
    tokenService = moduleRef.get(TokensService);
    authController = moduleRef.get(AuthController);
  });

  it('Контроллер существует', () => {
    expect(authController).toBeDefined();
  });

  it('Инициализация выполняется', async () => {
    expect(
      await initService.initial({
        email: 'theaut66@gmail.com',
        password: '123451223',
      }),
    ).toEqual('init work');
    const spyServiceInit = jest.spyOn(initService, 'initial');
    expect(spyServiceInit).toBeCalledTimes(1);
  });

  it('Авторизация ВК принимает код', async () => {
    expect(await authController.vkAuth({ code: '123' })).toEqual(
      'login vk work',
    );
    const spyServiceLoginVk = jest.spyOn(vkService, 'loginVk');
    expect(spyServiceLoginVk).toBeCalledTimes(1);
  });

  it('Авторизация гугл принимает код', async () => {
    expect(await authController.googleAuthRedirect({ code: '123' })).toEqual(
      'googleLogin work',
    );
    const spyServiceGoogleLogin = jest.spyOn(googleService, 'googleLogin');
    expect(spyServiceGoogleLogin).toBeCalledTimes(1);
  });

  it('Логин работает', async () => {
    expect(
      await authController.login({ email: '123', password: '123' }),
    ).toEqual('login work');
    const spyServiceLogin = jest.spyOn(authService, 'login');
    expect(spyServiceLogin).toBeCalledTimes(1);
  });

  it('Регистрация работает', async () => {
    expect(
      await authController.registration({ email: '123', password: '123' }),
    ).toEqual('registration work');
    const spyServiceRegistration = jest.spyOn(authService, 'registration');
    expect(spyServiceRegistration).toBeCalledTimes(1);
  });

  it('Логаут работает', async () => {
    expect(await authController.logout('refresh')).toEqual('logout work');
    const spyServiceLogout = jest.spyOn(authService, 'logout');
    expect(spyServiceLogout).toBeCalledTimes(1);
  });

  it('Рефреш работает', async () => {
    expect(await authController.refresh('refresh')).toEqual('refresh work');
    const spyServiceRefresh = jest.spyOn(tokenService, 'refresh');
    expect(spyServiceRefresh).toBeCalledTimes(1);
  });
});
