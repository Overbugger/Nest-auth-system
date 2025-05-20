import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginDto } from './dto/login.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { Request as ExpressRequest } from 'express';

interface RequestWithCsrf extends ExpressRequest {
  csrfToken(): string;
}

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Body() loginDto: LoginDto, @Res() res) {
    const result = await this.authService.login(req.user);
    return res.status(200).json(result);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res) {
    const { accessToken } = await this.authService.validateOAuthLogin(req.user);
    res.redirect(`http://localhost:4200/auth?token=${accessToken}`);
  }

  @Get('auth0/login')
  @UseGuards(AuthGuard('auth0'))
  auth0Login() {
    // This will redirect to Auth0
  }

  @Get('auth0/callback')
  @UseGuards(AuthGuard('auth0'))
  async auth0Callback(@Req() req, @Res() res) {
    const tokens = await this.authService.validateOAuthLogin(req.user);
    return res.status(200).json({
      message: 'Auth0 login successful',
      tokens,
      user: req.user,
    });
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const decoded = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      return this.authService.refreshTokens(
        decoded.sub,
        refreshTokenDto.refreshToken,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    await this.authService.logout(req.user.id);
    return { message: 'Logout successful' };
  }

  @Get('csrf-token')
  getCsrfToken(@Req() req: RequestWithCsrf) {
    return { csrfToken: req.csrfToken() };
  }
}
