// services/MasterServices/index.ts
import { createCrudService } from "../CreateCrudService";
import { Uom, CreateUom, UpdateUom } from "../../types/UomTypes";
import { Pallet, CreatePallet, UpdatePallet } from "../../types/PalletTypes";
import { Supplier, CreateSupplier, UpdateSupplier } from "../../types/SupplierTypes";
import { Io, CreateIo, UpdateIo } from "../../types/IoTypes";
import { Warehouse, CreateWarehouse, UpdateWarehouse } from "../../types/WarehouseTypes";
import { Menu, CreateMenu, UpdateMenu } from "../../types/MenuTypes";
import { Item, CreateItem, UpdateItem } from "../../types/ItemTypes";
import { InboundPlanning, CreateInboundPlanning, UpdateInboundPlanning } from "../../types/InboundPlanningTypes";
import { User, CreateUser, UpdateUser } from "../../types/UserTypes";
import { CheckerAssign, CreateCheckerAssign, UpdateCheckerAssign } from "../../types/CheckerAssignTypes";
import { Classification, CreateClassification, UpdateClassification } from "../../types/ClassificationTypes";
import { Vehicle, CreateVehicle, UpdateVehicle } from "../../types/VehicleTypes";
import { Transporter, CreateTransporter, UpdateTransporter } from "../../types/TransporterTypes";
import { SubWarehouse, CreateSubWarehouse, UpdateSubWarehouse } from "../../types/SubWarehouseTypes";
import { Bin, CreateBin, UpdateBin } from "../../types/MasterBinTypes";
import { Source, CreateSource, UpdateSource } from "../../types/MasterSourceTypes";




// Daftar semua entitas service di sini
export const uomService = createCrudService<Uom, CreateUom, UpdateUom>("/master-uom");
export const palletService = createCrudService<Pallet, CreatePallet, UpdatePallet>("/master-pallet");
export const supplierService = createCrudService<Supplier, CreateSupplier, UpdateSupplier>("/master-supplier");
export const IoService = createCrudService<Io, CreateIo, UpdateIo>("/master-io");
export const warehouseService = createCrudService<Warehouse, CreateWarehouse, UpdateWarehouse>("/master-warehouse");
export const MenuService = createCrudService<Menu, CreateMenu, UpdateMenu>("/menu");
export const ParentMenuService = createCrudService<Menu, CreateMenu, UpdateMenu>("/menu/parent");
export const ItemService = createCrudService<Item, CreateItem, UpdateItem>("/master-item");
export const InboundPlanningService = createCrudService<InboundPlanning, CreateInboundPlanning, UpdateInboundPlanning>("/inbound-plan");
export const UserService = createCrudService<User, CreateUser, UpdateUser>("/user");
export const CheckerAssignService = createCrudService<CheckerAssign, CreateCheckerAssign, UpdateCheckerAssign>("/checker-assign");
export const ClassificationService = createCrudService<Classification, CreateClassification, UpdateClassification>("/master-classification-item");
export const VehicleService = createCrudService<Vehicle, CreateVehicle, UpdateVehicle>("/master-vehicle");
export const TransporterService = createCrudService<Transporter, CreateTransporter, UpdateTransporter>("/inbound-transporter");
export const subWarehouseService = createCrudService<SubWarehouse, CreateSubWarehouse, UpdateSubWarehouse>("/master-warehouse-sub");
export const binService = createCrudService<Bin, CreateBin, UpdateBin>("/master-warehouse-bin");

export const sourceService = createCrudService<Source, CreateSource, UpdateSource>("/master-source");