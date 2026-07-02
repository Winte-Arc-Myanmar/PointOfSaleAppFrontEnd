/**
 * DI container - wires infrastructure to application.
 * Infrastructure layer.
 */

import { HttpClient } from "../api/HttpClient";
import { ApiProductRepository } from "../repositories/ApiProductRepository";
import { ApiAuthRepository } from "../repositories/ApiAuthRepository";
import { ApiTenantRepository } from "../repositories/ApiTenantRepository";
import { ApiUserRepository } from "../repositories/ApiUserRepository";
import { ApiProductVariantRepository } from "../repositories/ApiProductVariantRepository";
import { ApiUomClassRepository } from "../repositories/ApiUomClassRepository";
import { ApiUomRepository } from "../repositories/ApiUomRepository";
import { ApiCategoryRepository } from "../repositories/ApiCategoryRepository";
import { ApiBranchRepository } from "../repositories/ApiBranchRepository";
import { ApiLocationRepository } from "../repositories/ApiLocationRepository";
import { ApiDiningZoneRepository } from "../repositories/ApiDiningZoneRepository";
import { ApiDiningTableRepository } from "../repositories/ApiDiningTableRepository";
import { ApiInventoryLedgerRepository } from "../repositories/ApiInventoryLedgerRepository";
import { ApiSystemAdminRepository } from "../repositories/ApiSystemAdminRepository";
import { ApiRoleRepository } from "../repositories/ApiRoleRepository";
import { ApiPermissionRepository } from "../repositories/ApiPermissionRepository";
import { ApiVendorRepository } from "../repositories/ApiVendorRepository";
import { ApiCustomerRepository } from "../repositories/ApiCustomerRepository";
import { ApiLoyaltyLedgerRepository } from "../repositories/ApiLoyaltyLedgerRepository";
import { ApiCustomerInteractionRepository } from "../repositories/ApiCustomerInteractionRepository";
import { ProductService } from "@/core/application/services/ProductService";
import { ProductVariantService } from "@/core/application/services/ProductVariantService";
import { AuthService } from "@/core/application/services/AuthService";
import { TenantService } from "@/core/application/services/TenantService";
import { UserService } from "@/core/application/services/UserService";
import { UomClassService } from "@/core/application/services/UomClassService";
import { UomService } from "@/core/application/services/UomService";
import { CategoryService } from "@/core/application/services/CategoryService";
import { BranchService } from "@/core/application/services/BranchService";
import { LocationService } from "@/core/application/services/LocationService";
import { DiningZoneService } from "@/core/application/services/DiningZoneService";
import { DiningTableService } from "@/core/application/services/DiningTableService";
import { InventoryLedgerService } from "@/core/application/services/InventoryLedgerService";
import { SystemAdminService } from "@/core/application/services/SystemAdminService";
import { RoleService } from "@/core/application/services/RoleService";
import { PermissionService } from "@/core/application/services/PermissionService";
import { VendorService } from "@/core/application/services/VendorService";
import { CustomerService } from "@/core/application/services/CustomerService";
import { LoyaltyLedgerService } from "@/core/application/services/LoyaltyLedgerService";
import { CustomerInteractionService } from "@/core/application/services/CustomerInteractionService";
import { ApiUploadRepository } from "../repositories/ApiUploadRepository";
import { UploadService } from "@/core/application/services/UploadService";
import { ApiSalesOrderRepository } from "../repositories/ApiSalesOrderRepository";
import { ApiSalesOrderLineRepository } from "../repositories/ApiSalesOrderLineRepository";
import { ApiSalesOrderPaymentRepository } from "../repositories/ApiSalesOrderPaymentRepository";
import { SalesOrderService } from "@/core/application/services/SalesOrderService";
import { SalesOrderLineService } from "@/core/application/services/SalesOrderLineService";
import { SalesOrderPaymentService } from "@/core/application/services/SalesOrderPaymentService";
import { ApiPromotionRuleRepository } from "../repositories/ApiPromotionRuleRepository";
import { PromotionRuleService } from "@/core/application/services/PromotionRuleService";
import { ApiPosRegisterRepository } from "../repositories/ApiPosRegisterRepository";
import { ApiPosSessionRepository } from "../repositories/ApiPosSessionRepository";
import { PosRegisterService } from "@/core/application/services/PosRegisterService";
import { PosSessionService } from "@/core/application/services/PosSessionService";
import { ApiPaymentMethodRepository } from "../repositories/ApiPaymentMethodRepository";
import { PaymentMethodService } from "@/core/application/services/PaymentMethodService";
import { ApiChartOfAccountRepository } from "../repositories/ApiChartOfAccountRepository";
import { ChartOfAccountService } from "@/core/application/services/ChartOfAccountService";
import { ApiAccountingPeriodRepository } from "../repositories/ApiAccountingPeriodRepository";
import { AccountingPeriodService } from "@/core/application/services/AccountingPeriodService";
import { ApiExchangeRateRepository } from "../repositories/ApiExchangeRateRepository";
import { ExchangeRateService } from "@/core/application/services/ExchangeRateService";
import { ApiTaxRateRepository } from "../repositories/ApiTaxRateRepository";
import { TaxRateService } from "@/core/application/services/TaxRateService";
import { ApiJournalEntryRepository } from "../repositories/ApiJournalEntryRepository";
import { JournalEntryService } from "@/core/application/services/JournalEntryService";
import { ApiJournalLineRepository } from "../repositories/ApiJournalLineRepository";
import { JournalLineService } from "@/core/application/services/JournalLineService";
import { ApiBankStatementRepository } from "../repositories/ApiBankStatementRepository";
import { BankStatementService } from "@/core/application/services/BankStatementService";
import { ApiBankStatementLineRepository } from "../repositories/ApiBankStatementLineRepository";
import { BankStatementLineService } from "@/core/application/services/BankStatementLineService";
import { ApiReconciliationMatchRepository } from "../repositories/ApiReconciliationMatchRepository";
import { ReconciliationMatchService } from "@/core/application/services/ReconciliationMatchService";
import { ApiFixedAssetRepository } from "../repositories/ApiFixedAssetRepository";
import { FixedAssetService } from "@/core/application/services/FixedAssetService";
import { ApiDepreciationScheduleRepository } from "../repositories/ApiDepreciationScheduleRepository";
import { DepreciationScheduleService } from "@/core/application/services/DepreciationScheduleService";
import { ApiCheckoutRepository } from "../repositories/ApiCheckoutRepository";
import { ApiReceiptRepository } from "../repositories/ApiReceiptRepository";
import { ApiRefundRepository } from "../repositories/ApiRefundRepository";
import { CheckoutService } from "@/core/application/services/CheckoutService";
import { ReceiptService } from "@/core/application/services/ReceiptService";
import { RefundService } from "@/core/application/services/RefundService";
import type { IProductRepository } from "@/core/domain/repositories/IProductRepository";
import type { IProductVariantRepository } from "@/core/domain/repositories/IProductVariantRepository";
import type { IAuthRepository } from "@/core/domain/repositories/IAuthRepository";
import type { ITenantRepository } from "@/core/domain/repositories/ITenantRepository";
import type { IUserRepository } from "@/core/domain/repositories/IUserRepository";
import type { IUomClassRepository } from "@/core/domain/repositories/IUomClassRepository";
import type { IUomRepository } from "@/core/domain/repositories/IUomRepository";
import type { ICategoryRepository } from "@/core/domain/repositories/ICategoryRepository";
import type { IBranchRepository } from "@/core/domain/repositories/IBranchRepository";
import type { ILocationRepository } from "@/core/domain/repositories/ILocationRepository";
import type { IInventoryLedgerRepository } from "@/core/domain/repositories/IInventoryLedgerRepository";
import type { ISystemAdminRepository } from "@/core/domain/repositories/ISystemAdminRepository";
import type { IRoleRepository } from "@/core/domain/repositories/IRoleRepository";
import type { IPermissionRepository } from "@/core/domain/repositories/IPermissionRepository";
import type { IVendorRepository } from "@/core/domain/repositories/IVendorRepository";
import type { ICustomerRepository } from "@/core/domain/repositories/ICustomerRepository";
import type { ILoyaltyLedgerRepository } from "@/core/domain/repositories/ILoyaltyLedgerRepository";
import type { ICustomerInteractionRepository } from "@/core/domain/repositories/ICustomerInteractionRepository";
import type { IProductService } from "@/core/domain/services/IProductService";
import type { IProductVariantService } from "@/core/domain/services/IProductVariantService";
import type { IAuthService } from "@/core/domain/services/IAuthService";
import type { ITenantService } from "@/core/domain/services/ITenantService";
import type { IUserService } from "@/core/domain/services/IUserService";
import type { IUomClassService } from "@/core/domain/services/IUomClassService";
import type { IUomService } from "@/core/domain/services/IUomService";
import type { ICategoryService } from "@/core/domain/services/ICategoryService";
import type { IBranchService } from "@/core/domain/services/IBranchService";
import type { ILocationService } from "@/core/domain/services/ILocationService";
import type { IDiningZoneRepository } from "@/core/domain/repositories/IDiningZoneRepository";
import type { IDiningZoneService } from "@/core/domain/services/IDiningZoneService";
import type { IDiningTableRepository } from "@/core/domain/repositories/IDiningTableRepository";
import type { IDiningTableService } from "@/core/domain/services/IDiningTableService";
import type { IInventoryLedgerService } from "@/core/domain/services/IInventoryLedgerService";
import type { ISystemAdminService } from "@/core/domain/services/ISystemAdminService";
import type { IRoleService } from "@/core/domain/services/IRoleService";
import type { IPermissionService } from "@/core/domain/services/IPermissionService";
import type { IVendorService } from "@/core/domain/services/IVendorService";
import type { ICustomerService } from "@/core/domain/services/ICustomerService";
import type { ILoyaltyLedgerService } from "@/core/domain/services/ILoyaltyLedgerService";
import type { ICustomerInteractionService } from "@/core/domain/services/ICustomerInteractionService";
import type { IUploadRepository } from "@/core/domain/repositories/IUploadRepository";
import type { IUploadService } from "@/core/domain/services/IUploadService";
import type { ISalesOrderRepository } from "@/core/domain/repositories/ISalesOrderRepository";
import type { ISalesOrderLineRepository } from "@/core/domain/repositories/ISalesOrderLineRepository";
import type { ISalesOrderPaymentRepository } from "@/core/domain/repositories/ISalesOrderPaymentRepository";
import type { ISalesOrderService } from "@/core/domain/services/ISalesOrderService";
import type { ISalesOrderLineService } from "@/core/domain/services/ISalesOrderLineService";
import type { ISalesOrderPaymentService } from "@/core/domain/services/ISalesOrderPaymentService";
import type { IPromotionRuleRepository } from "@/core/domain/repositories/IPromotionRuleRepository";
import type { IPromotionRuleService } from "@/core/domain/services/IPromotionRuleService";
import type { IPosRegisterRepository } from "@/core/domain/repositories/IPosRegisterRepository";
import type { IPosRegisterService } from "@/core/domain/services/IPosRegisterService";
import type { IPosSessionRepository } from "@/core/domain/repositories/IPosSessionRepository";
import type { IPosSessionService } from "@/core/domain/services/IPosSessionService";
import type { IPaymentMethodRepository } from "@/core/domain/repositories/IPaymentMethodRepository";
import type { IPaymentMethodService } from "@/core/domain/services/IPaymentMethodService";
import type { IChartOfAccountRepository } from "@/core/domain/repositories/IChartOfAccountRepository";
import type { IChartOfAccountService } from "@/core/domain/services/IChartOfAccountService";
import type { IAccountingPeriodRepository } from "@/core/domain/repositories/IAccountingPeriodRepository";
import type { IAccountingPeriodService } from "@/core/domain/services/IAccountingPeriodService";
import type { IExchangeRateRepository } from "@/core/domain/repositories/IExchangeRateRepository";
import type { IExchangeRateService } from "@/core/domain/services/IExchangeRateService";
import type { ITaxRateRepository } from "@/core/domain/repositories/ITaxRateRepository";
import type { ITaxRateService } from "@/core/domain/services/ITaxRateService";
import type { IJournalEntryRepository } from "@/core/domain/repositories/IJournalEntryRepository";
import type { IJournalEntryService } from "@/core/domain/services/IJournalEntryService";
import type { IJournalLineRepository } from "@/core/domain/repositories/IJournalLineRepository";
import type { IJournalLineService } from "@/core/domain/services/IJournalLineService";
import type { IBankStatementRepository } from "@/core/domain/repositories/IBankStatementRepository";
import type { IBankStatementService } from "@/core/domain/services/IBankStatementService";
import type { IBankStatementLineRepository } from "@/core/domain/repositories/IBankStatementLineRepository";
import type { IBankStatementLineService } from "@/core/domain/services/IBankStatementLineService";
import type { IReconciliationMatchRepository } from "@/core/domain/repositories/IReconciliationMatchRepository";
import type { IReconciliationMatchService } from "@/core/domain/services/IReconciliationMatchService";
import type { IFixedAssetRepository } from "@/core/domain/repositories/IFixedAssetRepository";
import type { IFixedAssetService } from "@/core/domain/services/IFixedAssetService";
import type { IDepreciationScheduleRepository } from "@/core/domain/repositories/IDepreciationScheduleRepository";
import type { IDepreciationScheduleService } from "@/core/domain/services/IDepreciationScheduleService";
import type { ICheckoutRepository } from "@/core/domain/repositories/ICheckoutRepository";
import type { IReceiptRepository } from "@/core/domain/repositories/IReceiptRepository";
import type { IRefundRepository } from "@/core/domain/repositories/IRefundRepository";
import type { ICheckoutService } from "@/core/domain/services/ICheckoutService";
import type { IReceiptService } from "@/core/domain/services/IReceiptService";
import type { IRefundService } from "@/core/domain/services/IRefundService";

class Container {
  private instances = new Map<string, unknown>();

  constructor() {
    const httpClient = new HttpClient();
    const productRepository = new ApiProductRepository(httpClient);
    const productService = new ProductService(productRepository);
    const authRepository = new ApiAuthRepository(httpClient);
    const authService = new AuthService(authRepository);
    const tenantRepository = new ApiTenantRepository(httpClient);
    const tenantService = new TenantService(tenantRepository);
    const userRepository = new ApiUserRepository(httpClient);
    const userService = new UserService(userRepository);
    const productVariantRepository = new ApiProductVariantRepository(
      httpClient
    );
    const productVariantService = new ProductVariantService(
      productVariantRepository
    );
    const uomClassRepository = new ApiUomClassRepository(httpClient);
    const uomClassService = new UomClassService(uomClassRepository);
    const uomRepository = new ApiUomRepository(httpClient);
    const uomService = new UomService(uomRepository);
    const categoryRepository = new ApiCategoryRepository(httpClient);
    const categoryService = new CategoryService(categoryRepository);
    const branchRepository = new ApiBranchRepository(httpClient);
    const branchService = new BranchService(branchRepository);
    const locationRepository = new ApiLocationRepository(httpClient);
    const locationService = new LocationService(locationRepository);
    const diningZoneRepository = new ApiDiningZoneRepository(httpClient);
    const diningZoneService = new DiningZoneService(diningZoneRepository);
    const diningTableRepository = new ApiDiningTableRepository(httpClient);
    const diningTableService = new DiningTableService(diningTableRepository);
    const inventoryLedgerRepository = new ApiInventoryLedgerRepository(
      httpClient
    );
    const inventoryLedgerService = new InventoryLedgerService(
      inventoryLedgerRepository
    );
    const systemAdminRepository = new ApiSystemAdminRepository(httpClient);
    const systemAdminService = new SystemAdminService(systemAdminRepository);
    const roleRepository = new ApiRoleRepository(httpClient);
    const roleService = new RoleService(roleRepository);
    const permissionRepository = new ApiPermissionRepository(httpClient);
    const permissionService = new PermissionService(permissionRepository);
    const vendorRepository = new ApiVendorRepository(httpClient);
    const vendorService = new VendorService(vendorRepository);
    const customerRepository = new ApiCustomerRepository(httpClient);
    const customerService = new CustomerService(customerRepository);
    const loyaltyLedgerRepository = new ApiLoyaltyLedgerRepository(httpClient);
    const loyaltyLedgerService = new LoyaltyLedgerService(loyaltyLedgerRepository);
    const customerInteractionRepository = new ApiCustomerInteractionRepository(
      httpClient
    );
    const customerInteractionService = new CustomerInteractionService(
      customerInteractionRepository
    );
    const uploadRepository = new ApiUploadRepository(httpClient);
    const uploadService = new UploadService(uploadRepository);
    const salesOrderRepository = new ApiSalesOrderRepository(httpClient);
    const salesOrderService = new SalesOrderService(salesOrderRepository);
    const salesOrderLineRepository = new ApiSalesOrderLineRepository(httpClient);
    const salesOrderLineService = new SalesOrderLineService(salesOrderLineRepository);
    const salesOrderPaymentRepository = new ApiSalesOrderPaymentRepository(httpClient);
    const salesOrderPaymentService = new SalesOrderPaymentService(
      salesOrderPaymentRepository
    );
    const promotionRuleRepository = new ApiPromotionRuleRepository(httpClient);
    const promotionRuleService = new PromotionRuleService(promotionRuleRepository);
    const posRegisterRepository = new ApiPosRegisterRepository(httpClient);
    const posRegisterService = new PosRegisterService(posRegisterRepository);
    const posSessionRepository = new ApiPosSessionRepository(httpClient);
    const posSessionService = new PosSessionService(posSessionRepository);
    const paymentMethodRepository = new ApiPaymentMethodRepository(httpClient);
    const paymentMethodService = new PaymentMethodService(paymentMethodRepository);
    const chartOfAccountRepository = new ApiChartOfAccountRepository(httpClient);
    const chartOfAccountService = new ChartOfAccountService(chartOfAccountRepository);
    const accountingPeriodRepository = new ApiAccountingPeriodRepository(httpClient);
    const accountingPeriodService = new AccountingPeriodService(accountingPeriodRepository);
    const exchangeRateRepository = new ApiExchangeRateRepository(httpClient);
    const exchangeRateService = new ExchangeRateService(exchangeRateRepository);
    const taxRateRepository = new ApiTaxRateRepository(httpClient);
    const taxRateService = new TaxRateService(taxRateRepository);
    const journalEntryRepository = new ApiJournalEntryRepository(httpClient);
    const journalEntryService = new JournalEntryService(journalEntryRepository);
    const journalLineRepository = new ApiJournalLineRepository(httpClient);
    const journalLineService = new JournalLineService(journalLineRepository);
    const bankStatementRepository = new ApiBankStatementRepository(httpClient);
    const bankStatementService = new BankStatementService(bankStatementRepository);
    const bankStatementLineRepository = new ApiBankStatementLineRepository(httpClient);
    const bankStatementLineService = new BankStatementLineService(bankStatementLineRepository);
    const reconciliationMatchRepository = new ApiReconciliationMatchRepository(httpClient);
    const reconciliationMatchService = new ReconciliationMatchService(reconciliationMatchRepository);
    const fixedAssetRepository = new ApiFixedAssetRepository(httpClient);
    const fixedAssetService = new FixedAssetService(fixedAssetRepository);
    const depreciationScheduleRepository = new ApiDepreciationScheduleRepository(httpClient);
    const depreciationScheduleService = new DepreciationScheduleService(
      depreciationScheduleRepository
    );
    const checkoutRepository = new ApiCheckoutRepository(httpClient);
    const checkoutService = new CheckoutService(checkoutRepository);
    const receiptRepository = new ApiReceiptRepository(httpClient);
    const receiptService = new ReceiptService(receiptRepository);
    const refundRepository = new ApiRefundRepository(httpClient);
    const refundService = new RefundService(refundRepository);

    this.register("httpClient", httpClient);
    this.register<IProductRepository>("productRepository", productRepository);
    this.register<IProductService>("productService", productService);
    this.register<IAuthRepository>("authRepository", authRepository);
    this.register<IAuthService>("authService", authService);
    this.register<ITenantRepository>("tenantRepository", tenantRepository);
    this.register<ITenantService>("tenantService", tenantService);
    this.register<IUserRepository>("userRepository", userRepository);
    this.register<IUserService>("userService", userService);
    this.register<IProductVariantRepository>(
      "productVariantRepository",
      productVariantRepository
    );
    this.register<IProductVariantService>(
      "productVariantService",
      productVariantService
    );
    this.register<IUomClassRepository>(
      "uomClassRepository",
      uomClassRepository
    );
    this.register<IUomClassService>("uomClassService", uomClassService);
    this.register<IUomRepository>("uomRepository", uomRepository);
    this.register<IUomService>("uomService", uomService);
    this.register<ICategoryRepository>(
      "categoryRepository",
      categoryRepository
    );
    this.register<ICategoryService>("categoryService", categoryService);
    this.register<IBranchRepository>("branchRepository", branchRepository);
    this.register<IBranchService>("branchService", branchService);
    this.register<ILocationRepository>("locationRepository", locationRepository);
    this.register<ILocationService>("locationService", locationService);
    this.register<IDiningZoneRepository>("diningZoneRepository", diningZoneRepository);
    this.register<IDiningZoneService>("diningZoneService", diningZoneService);
    this.register<IDiningTableRepository>("diningTableRepository", diningTableRepository);
    this.register<IDiningTableService>("diningTableService", diningTableService);
    this.register<IInventoryLedgerRepository>(
      "inventoryLedgerRepository",
      inventoryLedgerRepository
    );
    this.register<IInventoryLedgerService>(
      "inventoryLedgerService",
      inventoryLedgerService
    );
    this.register<ISystemAdminRepository>("systemAdminRepository", systemAdminRepository);
    this.register<ISystemAdminService>("systemAdminService", systemAdminService);
    this.register<IRoleRepository>("roleRepository", roleRepository);
    this.register<IRoleService>("roleService", roleService);
    this.register<IPermissionRepository>("permissionRepository", permissionRepository);
    this.register<IPermissionService>("permissionService", permissionService);
    this.register<IVendorRepository>("vendorRepository", vendorRepository);
    this.register<IVendorService>("vendorService", vendorService);
    this.register<ICustomerRepository>("customerRepository", customerRepository);
    this.register<ICustomerService>("customerService", customerService);
    this.register<ILoyaltyLedgerRepository>(
      "loyaltyLedgerRepository",
      loyaltyLedgerRepository
    );
    this.register<ILoyaltyLedgerService>(
      "loyaltyLedgerService",
      loyaltyLedgerService
    );
    this.register<ICustomerInteractionRepository>(
      "customerInteractionRepository",
      customerInteractionRepository
    );
    this.register<ICustomerInteractionService>(
      "customerInteractionService",
      customerInteractionService
    );
    this.register<IUploadRepository>("uploadRepository", uploadRepository);
    this.register<IUploadService>("uploadService", uploadService);
    this.register<ISalesOrderRepository>("salesOrderRepository", salesOrderRepository);
    this.register<ISalesOrderService>("salesOrderService", salesOrderService);
    this.register<ISalesOrderLineRepository>(
      "salesOrderLineRepository",
      salesOrderLineRepository
    );
    this.register<ISalesOrderLineService>(
      "salesOrderLineService",
      salesOrderLineService
    );
    this.register<ISalesOrderPaymentRepository>(
      "salesOrderPaymentRepository",
      salesOrderPaymentRepository
    );
    this.register<ISalesOrderPaymentService>(
      "salesOrderPaymentService",
      salesOrderPaymentService
    );
    this.register<IPromotionRuleRepository>(
      "promotionRuleRepository",
      promotionRuleRepository
    );
    this.register<IPromotionRuleService>(
      "promotionRuleService",
      promotionRuleService
    );
    this.register<IPosRegisterRepository>("posRegisterRepository", posRegisterRepository);
    this.register<IPosRegisterService>("posRegisterService", posRegisterService);
    this.register<IPosSessionRepository>("posSessionRepository", posSessionRepository);
    this.register<IPosSessionService>("posSessionService", posSessionService);
    this.register<IPaymentMethodRepository>(
      "paymentMethodRepository",
      paymentMethodRepository
    );
    this.register<IPaymentMethodService>("paymentMethodService", paymentMethodService);
    this.register<IChartOfAccountRepository>(
      "chartOfAccountRepository",
      chartOfAccountRepository
    );
    this.register<IChartOfAccountService>(
      "chartOfAccountService",
      chartOfAccountService
    );
    this.register<IAccountingPeriodRepository>(
      "accountingPeriodRepository",
      accountingPeriodRepository
    );
    this.register<IAccountingPeriodService>(
      "accountingPeriodService",
      accountingPeriodService
    );
    this.register<IExchangeRateRepository>(
      "exchangeRateRepository",
      exchangeRateRepository
    );
    this.register<IExchangeRateService>(
      "exchangeRateService",
      exchangeRateService
    );
    this.register<ITaxRateRepository>("taxRateRepository", taxRateRepository);
    this.register<ITaxRateService>("taxRateService", taxRateService);
    this.register<IJournalEntryRepository>(
      "journalEntryRepository",
      journalEntryRepository
    );
    this.register<IJournalEntryService>("journalEntryService", journalEntryService);
    this.register<IJournalLineRepository>("journalLineRepository", journalLineRepository);
    this.register<IJournalLineService>("journalLineService", journalLineService);
    this.register<IBankStatementRepository>(
      "bankStatementRepository",
      bankStatementRepository
    );
    this.register<IBankStatementService>("bankStatementService", bankStatementService);
    this.register<IBankStatementLineRepository>(
      "bankStatementLineRepository",
      bankStatementLineRepository
    );
    this.register<IBankStatementLineService>(
      "bankStatementLineService",
      bankStatementLineService
    );
    this.register<IReconciliationMatchRepository>(
      "reconciliationMatchRepository",
      reconciliationMatchRepository
    );
    this.register<IReconciliationMatchService>(
      "reconciliationMatchService",
      reconciliationMatchService
    );
    this.register<IFixedAssetRepository>("fixedAssetRepository", fixedAssetRepository);
    this.register<IFixedAssetService>("fixedAssetService", fixedAssetService);
    this.register<IDepreciationScheduleRepository>(
      "depreciationScheduleRepository",
      depreciationScheduleRepository
    );
    this.register<IDepreciationScheduleService>(
      "depreciationScheduleService",
      depreciationScheduleService
    );
    this.register<ICheckoutRepository>("checkoutRepository", checkoutRepository);
    this.register<ICheckoutService>("checkoutService", checkoutService);
    this.register<IReceiptRepository>("receiptRepository", receiptRepository);
    this.register<IReceiptService>("receiptService", receiptService);
    this.register<IRefundRepository>("refundRepository", refundRepository);
    this.register<IRefundService>("refundService", refundService);
  }

  register<T>(key: string, instance: T): void {
    this.instances.set(key, instance);
  }

  resolve<T>(key: string): T {
    const instance = this.instances.get(key);
    if (!instance) throw new Error(`No instance for key: ${key}`);
    return instance as T;
  }
}

const container = new Container();

export default container;
