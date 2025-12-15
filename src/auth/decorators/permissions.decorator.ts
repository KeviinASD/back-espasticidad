import { SetMetadata } from "@nestjs/common";
import { Resource } from "src/common/enums/resource.enum";

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: Resource[]) => SetMetadata(PERMISSIONS_KEY, permissions);