<a name="top"></a>
<p align="center"><img src="../../media/akamai-logo-no-tagline-original.png"></p>
<h1 align="center">Programmable CDN Tech Preview</h1>
<div align="center">
  <a href='https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md'><img src='https://img.shields.io/badge/license-custom-orange?style=flat-square' alt="License"></a>
  <a href="https://npmjs.org/package/akj-tech-preview"><img src="https://img.shields.io/npm/v/akj-tech-preview.svg?style=flat-square" alt="NPM version" /></a>
</div>

<br />
<div align="center">
  Interact with the Akamai <a href="https://techdocs.akamai.com/property-mgr/reference/api">Property Manager API</a> and <a href="https://techdocs.akamai.com/edgeworkers/docs/welcome-to-edgeworkers">EdgeWorkers</a> through JavaScript code.
</div>
<br />

> [!IMPORTANT]
>
> The goal of this tech preview is to gather feedback to further refine the existing capabilities and to identify areas for future development. This tech preview product may contain usability limitations and possibly some bugs. Do not use this tool to create or update properties enabled on the Akamai production network.
<br />

# User Defined Variables
`onConfig` can be used to setup [user defined variables](https://techdocs.akamai.com/property-mgr/docs/user-defined-vars). When using the Property Manager User Interface, variables are required to be defined in the `Property Variables` section.  When using the `config` object, variables can be defined implicitly using the `setVariable` function.

Using `setSetVariable` will defined the specific variable name for you, and allow its value to be set without needing to define it separately.

The `onConfig` function uses [Metadata stage matching](https://techdocs.akamai.com/property-mgr/docs/metadata-stage) to change the value of the variable at various points in the processing of the property.  A curl to the created property will produce a response that has 2 headers added: `x-test-pcdn-sample-2` and `x-test-pcdn-sample-3`.