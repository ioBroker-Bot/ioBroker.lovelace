import { CORE_SCHEMA, load, mergeTag } from 'js-yaml';

/**
 * The schema js-yaml 4 loaded with by default. js-yaml 5 dropped merge keys from its default, so a
 * theme built on another one (`<<: *base`) would keep a literal "<<" key instead of the inherited
 * values - a pattern many themes shared for Home Assistant use.
 */
const SCHEMA = CORE_SCHEMA.withTags(mergeTag);

/**
 * Parse the themes the user entered in the adapter settings (the same YAML Home Assistant takes
 * below `frontend: themes:`).
 *
 * Nothing entered is no theme at all. js-yaml 5 throws on a document without content (empty, only
 * blanks or only comments), which is a perfectly valid state of this setting.
 *
 * @param text - the YAML of the setting
 * @returns theme name -> theme; empty when nothing is configured
 * @throws {YAMLException} when the YAML is broken
 */
export function parseThemes(text: string | undefined | null): Record<string, unknown> {
    if (!text || !text.replace(/#.*$/gm, '').trim()) {
        return {};
    }
    const parsed = load(text, { schema: SCHEMA });
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
}
