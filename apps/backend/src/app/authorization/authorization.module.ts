import { Module, Global } from '@nestjs/common';
import { AuthorizationService } from './services/authorization.service';

// Policy Handlers importieren
import {
  UpdateTicketPolicyHandler,
  AssignTicketPolicyHandler,
  SetTicketPriorityPolicyHandler,
  SetTicketStatusPolicyHandler,
  UpdateProjectPolicyHandler,
  DeleteProjectPolicyHandler,
  ManageProjectMembersPolicyHandler,
  CreateLabelPolicyHandler,
  UpdateLabelPolicyHandler,
  DeleteLabelPolicyHandler,
} from './policies';

/**
 * Authorization Module
 * Stellt Authorization-Services und Policies global zur Verfügung
 */
@Global() // Macht Authorization überall verfügbar
@Module({
  providers: [
    // Services
    AuthorizationService,

    // Ticket Policy Handlers
    UpdateTicketPolicyHandler,
    AssignTicketPolicyHandler,
    SetTicketPriorityPolicyHandler,
    SetTicketStatusPolicyHandler,

    // Project Policy Handlers
    UpdateProjectPolicyHandler,
    DeleteProjectPolicyHandler,
    ManageProjectMembersPolicyHandler,

    // Label Policy Handlers
    CreateLabelPolicyHandler,
    UpdateLabelPolicyHandler,
    DeleteLabelPolicyHandler,
  ],
  exports: [
    // Services exportieren
    AuthorizationService,

    // Ticket Policy Handlers exportieren
    UpdateTicketPolicyHandler,
    AssignTicketPolicyHandler,
    SetTicketPriorityPolicyHandler,
    SetTicketStatusPolicyHandler,

    // Project Policy Handlers exportieren
    UpdateProjectPolicyHandler,
    DeleteProjectPolicyHandler,
    ManageProjectMembersPolicyHandler,

    // Label Policy Handlers exportieren
    CreateLabelPolicyHandler,
    UpdateLabelPolicyHandler,
    DeleteLabelPolicyHandler,
  ],
})
export class AuthorizationModule {}
