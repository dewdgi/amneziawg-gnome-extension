import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export class GsettingsManager {
    constructor(schemaId = null) {
        // Use the new method to look up the extension
        this._extensionObject = Extension.lookupByURL(import.meta.url);
        
        if (!this._extensionObject) {
            throw new Error('Could not find extension object');
        }

        if (!schemaId) {
            const meta = this._extensionObject.metadata;
            schemaId = meta['settings-schema'];
        }

        this.settings = this._extensionObject.getSettings(schemaId);

        if (!this.settings) {
            throw new Error(`Failed to load schema: ${schemaId}`);
        }
    }

    resetKey(key) {
        if (!this.settings.list_keys().includes(key)) {
            throw new Error(`Key '${key}' does not exist in the schema.`);
        }
        this.settings.reset(key);
        console.log(`Key '${key}' has been reset to its default value.`);
    }

    listKeys() {
        return this.settings.list_keys();
    }

    getValue(key) {
        if (!this.settings.list_keys().includes(key)) {
            throw new Error(`Key '${key}' does not exist in the schema.`);
        }
        
        const type = this.settings.get_value(key).get_type_string();
        if (type === 'i') {
            return this.settings.get_int(key);
        } else if (type === 's') {
            return this.settings.get_string(key);
        } else if (type === 'b') {
            return this.settings.get_boolean(key);
        }
        
        return this.settings.get_value(key).unpack();
    }

    setValue(key, value) {
        if (!this.settings.list_keys().includes(key)) {
            throw new Error(`Key '${key}' does not exist in the schema.`);
        }

        const type = this.settings.get_value(key).get_type_string();
        if (type === 'i') {
            this.settings.set_int(key, value);
        } else if (type === 's') {
            this.settings.set_string(key, value);
        } else if (type === 'b') {
            this.settings.set_boolean(key, value);
        } else {
            const variant = new GLib.Variant(type, value);
            this.settings.set_value(key, variant);
        }
        console.log(`Key '${key}' has been set to: ${value}`);
    }

    resetAllKeys() {
        const keys = this.listKeys();
        for (const key of keys) {
            this.resetKey(key);
        }
        console.log("All keys have been reset to their default values.");
    }

    getExtensionPath() {
        return this._extensionObject.path;
    }
}
