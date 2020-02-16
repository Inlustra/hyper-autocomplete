import { ui } from "./ui"

describe('UI Utils', () => {
    describe('getIconNameForFile', () => {
        it('should correctly get a dark icon', () => {
            expect(ui.getIconForFile('tslint.json', "dark")).toEqual("file_type_tslint.svg")
        });

        it('should match the default file type if none is known', () => {
            expect(ui.getIconForFile('.hyper.js.backup5', "dark")).toEqual("default_file.svg")
        });
    })
})