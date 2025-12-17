import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Services
import { AuthService } from './services/auth.service';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';

// Controller
import { AuthController } from './auth.controller';

// Policy Handlers importieren
import {
  UpdateTicketPolicyHandler,
  DeleteTicketPolicyHandler,
  UpdateProjectPolicyHandler,
  DeleteProjectPolicyHandler,
  ManageProjectMembersPolicyHandler,
  CreateLabelPolicyHandler,
  UpdateLabelPolicyHandler,
  DeleteLabelPolicyHandler,
  CreateCommentPolicyHandler,
  UpdateCommentPolicyHandler,
  DeleteCommentPolicyHandler,
} from './policies';

/**
 * Auth Module
 *
 * Stellt Authentication-Services, JWT-Strategie und Policy Handlers global zur Verfügung.
 */
@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: {
        expiresIn: '24h', // Token läuft nach 24 Stunden ab
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Authentication
    AuthService,
    JwtStrategy,

    // Ticket Policy Handlers
    UpdateTicketPolicyHandler,
    DeleteTicketPolicyHandler,

    // Project Policy Handlers
    UpdateProjectPolicyHandler,
    DeleteProjectPolicyHandler,
    ManageProjectMembersPolicyHandler,

    // Label Policy Handlers
    CreateLabelPolicyHandler,
    UpdateLabelPolicyHandler,
    DeleteLabelPolicyHandler,

    // Comment Policy Handlers
    CreateCommentPolicyHandler,
    UpdateCommentPolicyHandler,
    DeleteCommentPolicyHandler,
  ],
  exports: [
    // Authentication
    AuthService,
    JwtModule,
    PassportModule,

    // Ticket Policy Handlers exportieren
    UpdateTicketPolicyHandler,
    DeleteTicketPolicyHandler,

    // Project Policy Handlers exportieren
    UpdateProjectPolicyHandler,
    DeleteProjectPolicyHandler,
    ManageProjectMembersPolicyHandler,

    // Label Policy Handlers exportieren
    CreateLabelPolicyHandler,
    UpdateLabelPolicyHandler,
    DeleteLabelPolicyHandler,

    // Comment Policy Handlers exportieren
    CreateCommentPolicyHandler,
    UpdateCommentPolicyHandler,
    DeleteCommentPolicyHandler,
  ],
})
export class AuthModule {}
