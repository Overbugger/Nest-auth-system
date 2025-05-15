import { Controller, Get, Param, UseGuards, Request, NotFoundException, Post, Body, Put, Delete, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Get the currently authenticated user's profile
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.id);
    const { password, refreshToken, ...result } = user;
    return result;
  }

  // Get a user by ID (admin only or self)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    if (id !== req.user.id) {
      throw new ForbiddenException('You can only access your own user data');
    }

    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Remove sensitive data before returning
    const { password, refreshToken, ...result } = user;
    return result;
  }

  // Update user information
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    // Authorization check
    if (id !== req.user.id) {
      throw new ForbiddenException('You can only update your own user data');
    }
    
    const updatedUser = await this.usersService.update(id, updateUserDto);
    const { password, refreshToken, ...result } = updatedUser;
    return result;
  }
}