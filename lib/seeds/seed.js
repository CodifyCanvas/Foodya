"use strict";
// seeds/seed.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// === Load ENV Variables ===
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
// === Import Dependencies ===
var mysql2_1 = require("drizzle-orm/mysql2");
var promise_1 = require("mysql2/promise");
var drizzle_schema_1 = require("@/lib/drizzle-schema/");
// import * as schema from '@/lib/drizzle-schema/admin-panel.schema';
var drizzle_orm_1 = require("drizzle-orm");
var constants_1 = require("@/constants");
//  === Create MySQL Pool Connection === 
var pool = promise_1.default.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
});
//  === Get NavLinks and insert into modules & according to this set permissions === 
var extractLinks = function (navItems) {
    var links = [];
    for (var _i = 0, navItems_1 = navItems; _i < navItems_1.length; _i++) {
        var item = navItems_1[_i];
        if ('items' in item && Array.isArray(item.items)) {
            for (var _a = 0, _b = item.items; _a < _b.length; _a++) {
                var subItem = _b[_a];
                if (subItem.url && subItem.title) {
                    // Normalize URL if needed (e.g., remove /restaurant/)
                    var cleanUrl = subItem.url.replace(/^\/restaurant\//, '');
                    links.push({ title: subItem.title, url: cleanUrl });
                }
            }
        }
    }
    return links;
};
//  === Initialize Drizzle ORM with Pool === 
var seedDb = (0, mysql2_1.drizzle)(pool);
//  === Main Seeding Function === 
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var roleName, existingRole, roleId, newRole, adminEmail, existingUser, links, _i, links_1, link, slug, label, existingModule, modules, _a, modules_1, mod, existingPermission, transactionCategories, _b, transactionCategories_1, _c, id, category, description, existingCategory, err_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 29, 30, 32]);
                    roleName = 'admin';
                    return [4 /*yield*/, seedDb
                            .select()
                            .from(drizzle_schema_1.schema.roles)
                            .where((0, drizzle_orm_1.eq)(drizzle_schema_1.schema.roles.role, roleName))];
                case 1:
                    existingRole = (_d.sent())[0];
                    roleId = void 0;
                    if (!!(existingRole === null || existingRole === void 0 ? void 0 : existingRole.id)) return [3 /*break*/, 4];
                    return [4 /*yield*/, seedDb.insert(drizzle_schema_1.schema.roles).values({ role: roleName })];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, seedDb
                            .select()
                            .from(drizzle_schema_1.schema.roles)
                            .where((0, drizzle_orm_1.eq)(drizzle_schema_1.schema.roles.role, roleName))];
                case 3:
                    newRole = (_d.sent())[0];
                    roleId = newRole.id;
                    console.log('✅ Role created:', roleName);
                    return [3 /*break*/, 5];
                case 4:
                    roleId = existingRole.id;
                    console.log('ℹ️ Role already exists:', roleName);
                    _d.label = 5;
                case 5:
                    adminEmail = 'admin@example.com';
                    return [4 /*yield*/, seedDb
                            .select()
                            .from(drizzle_schema_1.schema.users)
                            .where((0, drizzle_orm_1.eq)(drizzle_schema_1.schema.users.email, adminEmail))];
                case 6:
                    existingUser = (_d.sent())[0];
                    if (!!existingUser) return [3 /*break*/, 8];
                    return [4 /*yield*/, seedDb.insert(drizzle_schema_1.schema.users).values({
                            name: 'Admin',
                            email: adminEmail,
                            password: '123456',
                            role_id: roleId,
                            is_active: true,
                        })];
                case 7:
                    _d.sent();
                    console.log('✅ Admin user created');
                    return [3 /*break*/, 9];
                case 8:
                    console.log('ℹ️ Admin user already exists');
                    _d.label = 9;
                case 9:
                    links = extractLinks(constants_1.navLink);
                    _i = 0, links_1 = links;
                    _d.label = 10;
                case 10:
                    if (!(_i < links_1.length)) return [3 /*break*/, 15];
                    link = links_1[_i];
                    slug = link.url;
                    label = link.title;
                    return [4 /*yield*/, seedDb
                            .select()
                            .from(drizzle_schema_1.schema.modules)
                            .where((0, drizzle_orm_1.eq)(drizzle_schema_1.schema.modules.name, slug))];
                case 11:
                    existingModule = (_d.sent())[0];
                    if (!!existingModule) return [3 /*break*/, 13];
                    return [4 /*yield*/, seedDb.insert(drizzle_schema_1.schema.modules).values({ name: slug, label: label })];
                case 12:
                    _d.sent();
                    console.log("\u2705 Module inserted: ".concat(slug));
                    return [3 /*break*/, 14];
                case 13:
                    console.log("\u2139\uFE0F Module already exists: ".concat(slug));
                    _d.label = 14;
                case 14:
                    _i++;
                    return [3 /*break*/, 10];
                case 15: return [4 /*yield*/, seedDb.select().from(drizzle_schema_1.schema.modules)];
                case 16:
                    modules = _d.sent();
                    _a = 0, modules_1 = modules;
                    _d.label = 17;
                case 17:
                    if (!(_a < modules_1.length)) return [3 /*break*/, 22];
                    mod = modules_1[_a];
                    return [4 /*yield*/, seedDb
                            .select()
                            .from(drizzle_schema_1.schema.permissions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_schema_1.schema.permissions.role_id, roleId), (0, drizzle_orm_1.eq)(drizzle_schema_1.schema.permissions.module_id, mod.id)))];
                case 18:
                    existingPermission = (_d.sent())[0];
                    if (!!existingPermission) return [3 /*break*/, 20];
                    return [4 /*yield*/, seedDb.insert(drizzle_schema_1.schema.permissions).values({
                            role_id: roleId,
                            module_id: mod.id,
                            label: "Full access to ".concat(mod.label),
                            can_view: true,
                            can_edit: true,
                            can_create: true,
                            can_delete: false,
                        })];
                case 19:
                    _d.sent();
                    console.log("\u2705 Permissions granted for module: ".concat(mod.name));
                    return [3 /*break*/, 21];
                case 20:
                    console.log("\u2139\uFE0F Permissions already set for module: ".concat(mod.name));
                    _d.label = 21;
                case 21:
                    _a++;
                    return [3 /*break*/, 17];
                case 22:
                    transactionCategories = [{
                            id: 1,
                            category: "salary",
                            description: "Monthly salary payments to employees",
                        }, {
                            id: 2,
                            category: "invoice",
                            description: "Transactions generated from customer invoices",
                        }, {
                            id: 3,
                            category: "others",
                            description: "Miscellaneous or uncategorized payments",
                        }];
                    _b = 0, transactionCategories_1 = transactionCategories;
                    _d.label = 23;
                case 23:
                    if (!(_b < transactionCategories_1.length)) return [3 /*break*/, 28];
                    _c = transactionCategories_1[_b], id = _c.id, category = _c.category, description = _c.description;
                    return [4 /*yield*/, seedDb
                            .select()
                            .from(drizzle_schema_1.schema.transactionCategoriesTable)
                            .where((0, drizzle_orm_1.eq)(drizzle_schema_1.schema.transactionCategoriesTable.category, category))];
                case 24:
                    existingCategory = (_d.sent())[0];
                    if (!!existingCategory) return [3 /*break*/, 26];
                    return [4 /*yield*/, seedDb.insert(drizzle_schema_1.schema.transactionCategoriesTable).values({
                            id: id,
                            category: category,
                            description: description,
                            locked: true,
                        })];
                case 25:
                    _d.sent();
                    console.log("\u2705 Transaction category inserted: ".concat(category));
                    return [3 /*break*/, 27];
                case 26:
                    console.log("\u2139\uFE0F Transaction category already exists: ".concat(category));
                    _d.label = 27;
                case 27:
                    _b++;
                    return [3 /*break*/, 23];
                case 28:
                    //  === Final Success Message === 
                    console.log('✅ Seeding complete.');
                    return [3 /*break*/, 32];
                case 29:
                    err_1 = _d.sent();
                    // === Error Handling ===
                    console.error('❌ Error running seed script:', err_1);
                    process.exitCode = 1; // Allow finally block to run before exiting
                    return [3 /*break*/, 32];
                case 30: 
                //  === Always Close Pool Connection === 
                return [4 /*yield*/, pool.end()];
                case 31:
                    //  === Always Close Pool Connection === 
                    _d.sent();
                    console.log('🔌 Database connection closed.');
                    process.exit(); // Gracefully exit the process
                    return [7 /*endfinally*/];
                case 32: return [2 /*return*/];
            }
        });
    });
}
//  === Execute Seeding === 
main();
