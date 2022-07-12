## Prepare the Tailwind template files

To create MODX templates with MODXTailwind, you need to copy your Tailwind CSS
template files to the `src` folder. The other template files must be copied to
the following folders:

- The main javascript file must be located in `src/js/main.js`.
- The main stylesheet file must be located in `src/css/style.scss`.
- The images referenced in the templates must be located in `src/images`

If you need a different folder structure or filenames, you must change the
folder references in `config/webpack.config.js` and in
`config/webpack.loaders.js`

## Develop the MODX template files

The Webpack 4 workflow creates deployable MODX templates while developing the
templates locally using the following commands:

- Develop on the fly: `npm run start`. This command will build and serve the
  templates on the fly. Each time you change the html, the css, the images etc.,
  the local webserver server will refresh the browser.

- Prepare production: `npm run dist:modx`. This command will compile the MODX
  templates and all used assets to folders used by MODX.

- Prepare production + full css: `npm run dist:dev_modx`. This command will do
  the same. But it will compile a full css file with all possible Tailwind CSS
  classes. This allows to develop the HTML chunks directly on server side.

After preparing the production templates, they can be synced with the online
host or with a local MODX installation.

## Webpack Build helpers

The included build helpers in `webpack.plugins.js` prepare the MODX templates:

- Copy the src folder to src_modx to prepare the replacements.

- Don’t use a hash in the generated assets because this can be different with
  each compilation.

- Use ChecksumFile for cache busting, because the checksum is generated server
  side by MODX.

- Replace the partial includes with MODX tags i.e. `[[$partials.header]]`. The
  partials must be created as MODX chunks afterwards.

- Prepare the title tag with MODX placeholders. The title tag can be changed in
  the setTitle method in `webpack.plugins.html`.

- Add a base tag with `href="[[!++site_url]]"`.

- Move the generated html templates to a folder that can be referenced by the
  `static_elements_basepath` MODX system setting.

## MODX extras and MODX system settings

- [ChecksumFile](https://modx.com/extras/package/checksumfile).

- [TailwindHelper](https://modx.com/extras/package/tailwindhelper).

- Fill the static_elements_basepath setting with
  `core/components/modxtailwind/elements` (optional).

- Enable the `setting_static_elements_automate_templates` setting (optional).

## Get used CSS classes with TailwindHelper

- TailwindHelper uses an entry in the Extras menu.

- It collects all used CSS classes in chunks, templates and the content field.
  That way it works well with ContentBlocks.

- The result is written to a safelist.json. The location of this file can be set
  by MODX system settings.

- Run TailwindHelper on your MODX installation and copy the generated safelist.json
  into the config/tailwindhelper folder of MODXTailwind. After this you are able
  to compile an optimised stylesheet for your site.

## Rules for CSS Classes in the Tailwind CSS templates

- Don’t construct class names dynamically:<br>
```<div class="text-[[+error:notempty=`red`:default=`green`]]"></div>```

- Use class names (only) in `notempty|default|then|else` modifiers (and their alternatives):<br>
```<div class="[[+error:notempty=`text-red`:default=`text-green`]]"></div>```

- Use full class tags in MODX tags<br>
```<div [[+error:notempty=`class="text-red"`:default=`class="text-green"`]]></div>```

## Ideas for future improvements

Sadly this workflow does not work automatic on server side. But the workflow can
be improved inside of MODX:

- New menu entry in TailwindHelper: Purge the full CSS with the safelist.json
- New option in MinifyX: Purge the full CSS with the safelist.json

