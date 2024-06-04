"use strict";
//
// =====================================================================
// Credit to wara for the original server mod to receive trader offers!!
// =====================================================================
//
// Tradermodding 1.6.3 servermod - by ChooChoo / wara
// 
Object.defineProperty(exports, "__esModule", { value: true });
const BaseClasses_1 = require("C:/snapshot/project/obj/models/enums/BaseClasses");
const Traders_1 = require("C:/snapshot/project/obj/models/enums/Traders");
class ChooChooTraderModding {
    preAkiLoad(container) {
        const staticRouterModService = container.resolve("StaticRouterModService");
        staticRouterModService.registerStaticRouter("TraderModdingRouter", [
            {
                url: "/choochoo-trader-modding/json",
                action: (url, info, sessionId, output) => {
                    const json = this.getTraderMods(container, sessionId, false);
                    return json;
                }
            },
            {
                url: "/choochoo-trader-modding/json-flea",
                action: (url, info, sessionId, output) => {
                    const json = this.getTraderMods(container, sessionId, true);
                    return json;
                }
            }
        ], "choochoo-trader-modding");
    }
    getTraderMods(container, sessionId, flea) {
        // Roubles, Dollars, Euros
        const money = ["5449016a4bdc2d6f028b456f", "5696686a4bdc2da3298b456a", "569668774bdc2da2298b4568"];
        const money_symbols = ["r", "d", "e"];
        const traderAssortHelper = container.resolve("TraderAssortHelper");
        const itemHelper = container.resolve("ItemHelper");
        const profileHelper = container.resolve("ProfileHelper");
        const pmcData = profileHelper.getPmcProfile(sessionId);
        const allTraderData = { dollar_to_ruble: 146, euro_to_ruble: 159, modsAndCosts: [] };
        const allTraderIds = Object.keys(Traders_1.Traders);
        allTraderIds.forEach(traderkey => {
            const trader = Traders_1.Traders[traderkey];
            // Skip fence, btr and lighthouse keeper
            if (traderkey == "FENCE" || traderkey == "BTR" || traderkey == "LIGHTHOUSEKEEPER")
                return;
            // Check if the trader is currently locked
            if (!pmcData.TradersInfo[trader].unlocked) {
                console.log("Trader: " + traderkey + " is locked, skipping items.");
                return;
            }
            const traderAssort = traderAssortHelper.getAssort(sessionId, trader, flea);
            // Just to be sure so any custom traders don't break.
            if (traderAssort == undefined || traderAssort.items == undefined)
                return;
            for (const item of traderAssort.items) {
                let addedByUnlimitedCount = false;
                if (itemHelper.isOfBaseclass(item._tpl, BaseClasses_1.BaseClasses.MOD)) {
                    if (traderAssort.barter_scheme[item._id] !== undefined) {
                        // for now no barter offers. Eventually might add the option to toggle it on in the config but I don't feel like it rn
                        const barterOffer = traderAssort.barter_scheme[item._id][0][0];
                        if (!this.isBarterOffer(barterOffer, money)) {
                            if (item.upd !== undefined) {
                                const mac = { "tpl": item._tpl, "cost": this.getCostString(barterOffer, money, money_symbols) };
                                if (item.upd.UnlimitedCount !== undefined) {
                                    // probably unnecessary but to be safe.
                                    if (item.upd.UnlimitedCount == true) {
                                        allTraderData.modsAndCosts.push(mac);
                                        addedByUnlimitedCount = true;
                                    }
                                }
                                if (item.upd.StackObjectsCount !== undefined && !addedByUnlimitedCount) {
                                    if (item.upd.StackObjectsCount > 0) {
                                        allTraderData.modsAndCosts.push(mac);
                                    }
                                }
                            }
                        }
                    }
                }
                else if (itemHelper.isOfBaseclass(item._tpl, BaseClasses_1.BaseClasses.MONEY)) {
                    // Dollar
                    if (item._tpl == "5696686a4bdc2da3298b456a") {
                        const t = traderAssort.barter_scheme[item._id][0][0];
                        if (t !== undefined && t.count != undefined)
                            allTraderData.dollar_to_ruble = Math.ceil(t.count);
                    }
                    // Euro
                    else if (item._tpl == "569668774bdc2da2298b4568") {
                        const t = traderAssort.barter_scheme[item._id][0][0];
                        if (t !== undefined && t.count != undefined)
                            allTraderData.euro_to_ruble = Math.ceil(t.count);
                    }
                }
            }
        });
        const json = JSON.stringify(allTraderData);
        return json;
    }
    isBarterOffer(barter_scheme, money) {
        if (money.includes(barter_scheme._tpl)) {
            return false;
        }
        return true;
    }
    getCostString(barter_scheme, money, money_symbols) {
        const moneyIndex = money.findIndex((string) => string == barter_scheme._tpl);
        if (moneyIndex == -1)
            return "";
        return Math.ceil(barter_scheme.count).toString() + money_symbols[moneyIndex];
    }
}
module.exports = { mod: new ChooChooTraderModding() };
//# sourceMappingURL=mod.js.map