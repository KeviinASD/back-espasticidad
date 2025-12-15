import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { ROLES_KEY, Roles } from "./roles.decorator";
import { RolesGuard } from "../guards/roles/roles.guard";
import { AuthGuard } from "../guards/auth/authentication.guard";
import { Permissions } from "./permissions.decorator";
import { PermissionDto } from "src/modules/security/dto/role-create.dto";


export function Auth(...permission: PermissionDto[]) {
    return applyDecorators(
        /* Permissions(...permission), */
        UseGuards(AuthGuard, RolesGuard),
    )
}