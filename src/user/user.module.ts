import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { UserResolver } from './user.resolver';

@Module({
  providers: [UserService, UserRepository, UserResolver],
  exports: [UserService],
})
export class UserModule {}
