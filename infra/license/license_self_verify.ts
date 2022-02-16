import {readFileSync, writeFileSync} from 'fs';
import {EOL} from 'os';

import * as licenseBlockList from "./license-blocklist.json";
import * as packageLicenseReg from "./package-license-registry.json";


/**
 * Argument List
 *  - Input path for list of used licenses
 *  - Output path for verification result
 *  - Subtitle for verification result
 */
var args = process.argv.slice(2)
const usedLicenseList = JSON.parse(readFileSync(args[0], 'utf-8'));
const outputPath = args[1];
const subtitle = args[2];

var warningList = {
    "WarningCount" : 0,
    "WarnedLicenseUsed" : [] as string[],
    "NeverChecked" : [] as string[]
};
var criticalList = {
    "CriticalCount" : 0,
    "ONEForbidden" : [] as string[],
    "DeniedLicenseUsed" : [] as string[]
};

for (const pkg in usedLicenseList)
{
    var pkgInfo = usedLicenseList[pkg];
    if (packageLicenseReg.hasOwnProperty(pkg))
    {
        const pkgKey = pkg as keyof typeof packageLicenseReg;

        if (packageLicenseReg[pkgKey].ONE_permitted == "no")
        {
            criticalList.CriticalCount++;
            criticalList.ONEForbidden.push(pkg + EOL);
        }
        else if (packageLicenseReg[pkgKey].ONE_permitted == "yes")
        {
            // Do nothing
        }
        else if (packageLicenseReg[pkgKey].ONE_permitted == "conditional")
        {
            // Only check when release
        }
        else
        {
            throw new Error("Not implemented permission");
        }
    }
    else if(licenseBlockList.Denied.includes(pkgInfo.licenses))
    {
        criticalList.CriticalCount++;
        criticalList.DeniedLicenseUsed.push(pkg + " : " + pkgInfo.licenses + EOL);
    }
    else if(licenseBlockList.Warning.includes(pkgInfo.licenses))
    {
        warningList.WarningCount++;
        warningList.WarnedLicenseUsed.push(pkg + " : " + pkgInfo.licenses + EOL);
    }
    else if(licenseBlockList.Allowed.includes(pkgInfo.licenses))
    {
        // Do Nothing
    }
    else
    {
        warningList.WarningCount++;
        warningList.NeverChecked.push(pkg + " : " + pkgInfo.licenses + EOL);
    }
}

var resultMsg = "### " + subtitle + EOL + EOL;
var issueFound = false;

if (warningList.WarningCount > 0)
{
    issueFound = true;
    resultMsg += (":warning: **Warning** :warning:" + EOL);
    
    if (warningList.NeverChecked.length > 0)
    {
        resultMsg += ("- Following licenses are never checked" + EOL);
        warningList.NeverChecked.forEach(msg => {
            resultMsg += ("    - " + msg);
        });
    }
    if (warningList.WarnedLicenseUsed.length > 0)
    {
        resultMsg += ("- Further verification is needed for following licenses" + EOL);
        warningList.WarnedLicenseUsed.forEach(msg => {
            resultMsg += ("    - " + msg);
        });
    }

    resultMsg += EOL;
}

if (criticalList.CriticalCount > 0)
{
    issueFound = true;
    resultMsg += (":no_entry: **Critical** :no_entry:" + EOL);

    if (criticalList.ONEForbidden.length > 0)
    {
        resultMsg += ("- Following packages are forbidden in ONE" + EOL);
        criticalList.ONEForbidden.forEach(msg => {
            resultMsg += ("    - " + msg);
        });
    }
    if (criticalList.DeniedLicenseUsed.length > 0)
    {
        resultMsg += ("- Following packages use denied licenses" + EOL);
        criticalList.DeniedLicenseUsed.forEach(msg => {
            resultMsg += ("    - " + msg);
        });
    }

    resultMsg += EOL;
}

if (issueFound == false)
{
    resultMsg += (":heavy_check_mark: No license issue found" + EOL);
}

writeFileSync(outputPath, resultMsg);
