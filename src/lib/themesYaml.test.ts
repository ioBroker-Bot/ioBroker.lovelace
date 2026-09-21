import { expect } from 'chai';
import { parseThemes } from './themesYaml';

describe('lib/themesYaml parseThemes', function () {
    it('reads the themes by name', function () {
        const themes = parseThemes('my_theme:\n  primary-color: "#03a9f4"\nother:\n  primary-color: red\n');
        expect(Object.keys(themes)).to.deep.equal(['my_theme', 'other']);
        expect(themes.my_theme).to.deep.equal({ 'primary-color': '#03a9f4' });
    });

    it('has no theme when nothing is configured', function () {
        // js-yaml 5 throws "expected a document, but the input is empty" on all of these.
        for (const text of ['', '   \n  ', '# my themes\n# none yet', undefined, null]) {
            expect(parseThemes(text), JSON.stringify(text)).to.deep.equal({});
        }
    });

    it('resolves merge keys, so a theme can build on another one', function () {
        const themes = parseThemes(
            'base: &base\n  primary-color: blue\n  text-color: black\ndark:\n  <<: *base\n  primary-color: red\n',
        );
        expect(themes.dark).to.deep.equal({ 'primary-color': 'red', 'text-color': 'black' });
    });

    it('keeps yes and no as text, the way js-yaml 4 did', function () {
        expect(parseThemes('t:\n  flag: yes\n').t).to.deep.equal({ flag: 'yes' });
    });

    it('ignores a document that is not a list of themes', function () {
        expect(parseThemes('- a\n- b\n')).to.deep.equal({});
        expect(parseThemes('just text')).to.deep.equal({});
    });

    it('throws on broken yaml, so the caller can tell the user', function () {
        expect(() => parseThemes('t:\n  a: [1, 2\n')).to.throw();
    });
});
