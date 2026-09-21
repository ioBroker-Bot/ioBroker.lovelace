import { expect } from 'chai';
import { readdirSync, readFileSync } from 'node:fs';

/**
 * The seed as it stands in the file.
 *
 * `dataSingleton` hands out this very object, and the converters assign their domain into it when
 * they are loaded - so requiring it here would show their additions instead of the seed.
 *
 * @returns the domains of the seed with their service names
 */
function seed(): Record<string, string[]> {
    const source = readFileSync(`${__dirname}/../../lib/services.js`, 'utf8');
    const domains: Record<string, string[]> = {};
    let domain: string | undefined;
    for (const line of source.split('\n')) {
        const domainMatch = /^ {4}([a-z_]+): \{$/.exec(line);
        if (domainMatch) {
            domain = domainMatch[1];
            domains[domain] = [];
        } else if (domain) {
            const serviceMatch = /^ {8}([a-z_]+): \{$/.exec(line);
            if (serviceMatch) {
                domains[domain].push(serviceMatch[1]);
            }
        }
    }
    return domains;
}

/**
 * Domains a converter or a module describes itself, i.e. `adapterData.services.<domain> = {...}`
 * or `services.<domain> = {...}`.
 *
 * @returns the domain names found in the sources
 */
function domainsDescribedInCode(): string[] {
    const found = new Set<string>();
    for (const dir of [`${__dirname}/converters`, `${__dirname}/modules`]) {
        for (const file of readdirSync(dir)) {
            if (!file.endsWith('.ts') || file.endsWith('.test.ts')) {
                continue;
            }
            const content = readFileSync(`${dir}/${file}`, 'utf8');
            for (const match of content.matchAll(/services\.([a-z_]+)\s*=\s*\{/g)) {
                found.add(match[1]);
            }
        }
    }
    return [...found];
}

describe('lib/services', function () {
    it('does not describe a domain a converter or module describes itself', function () {
        // Those assignments replace the entry completely, so a domain listed in both places keeps
        // two diverging copies of the descriptions around, one of which is never used.
        const services = seed();
        const overwritten = domainsDescribedInCode().filter(domain => services[domain]);
        expect(overwritten, `described twice: ${overwritten.join(', ')}`).to.be.empty;
    });

    it('only offers services the generic handlers can execute', function () {
        // Everything else ends in "Service not found" - the frontend should not offer it.
        const generic =
            /^(turn_on|turn_off|toggle|press|trigger|unlock|lock|update_entity|write|volume_set|volume_mute|set_[a-z_]+|select_option|[a-z_]+_say)$/;
        for (const [domain, domainServices] of Object.entries(seed())) {
            for (const service of domainServices) {
                expect(service, `${domain}.${service}`).to.match(generic);
            }
        }
    });
});
