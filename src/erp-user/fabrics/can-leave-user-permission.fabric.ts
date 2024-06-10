import { Injectable } from '@nestjs/common';
import { $Enums, ErpUserRoles } from '@prisma/client';

const ADMIN_CAN_LEAVE_ROLES = [...Object.values(ErpUserRoles)];
const EMPLOYEE_CAN_LEAVE_ROLES = ['MANAGER', 'TECHNICIAN', 'FRANCHISE'];
const MANAGER_CAN_LEAVE_ROLES = ['TECHNICIAN'];
const FRANCHISE_CAN_LEAVE_ROLES = ['TECHNICIAN', 'MANAGER'];

@Injectable()
export class CanLeaveUserPermissionFabric {
  canLeave(
    userRole: $Enums.ErpUserRoles,
    reqRole: $Enums.ErpUserRoles,
  ): boolean {
    switch (userRole) {
      case 'ADMIN':
        return ADMIN_CAN_LEAVE_ROLES.includes(reqRole);
      case 'EMPLOYEE':
        return EMPLOYEE_CAN_LEAVE_ROLES.includes(reqRole);
      case 'MANAGER':
        return MANAGER_CAN_LEAVE_ROLES.includes(reqRole);
      case 'FRANCHISE':
        return FRANCHISE_CAN_LEAVE_ROLES.includes(reqRole);
      case 'TECHNICIAN':
        return false;
      default:
        return false;
    }
  }
}
