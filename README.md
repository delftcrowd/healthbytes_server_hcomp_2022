# Kappa's GitHub Guidelines

- [Kappa's GitHub Guidelines](#kappas-github-guidelines)
- [Guidelines](#guidelines)
  - [Naming Convention](#naming-convention)
  - [Basic Information [Students only]](#basic-information-students-only)
  - [Introduction](#introduction)
  - [Research Summary](#research-summary)
  - [Keywords](#keywords)
  - [Data](#data)
  - [Dependencies](#dependencies)
  - [Installation & Usage](#installation--usage)
  - [License](#license)
- [Internal structure of repositories](#internal-structure-of-repositories)
  - [Code](#code)
  - [Student Project Report](#student-project-report)
- [README Template](#readme-template)
- [Tips for newcomers](#tips-for-newcomers)
  - [Reference](#reference)
  - [Editors](#editors)

This is a simple set of guidelines for all repositories belonging to Kappa @ WIS. Whilst these guidelines are only meant to get you started with your documentation, try to stick to them.

It is important that by the end of a given project, the relevant and necessary sections are included and detailed in **README** files.

The goal is to indirectly create a coherent navigation flow across the different research projects that are - and will be - stored here.

# Guidelines

## Naming Convention

- use lower case
- use underscores to separate tokens
- if related to a larger project, start with the name of this project, followed by the name of your project (e.g. 'seca_image_classification')

**Students**: in case of doubt ask your supervisors.

## Basic Information [Students only]

- Name of student
- Names of supervisors
- Academic year

For non-student project this section can be omitted.

## Introduction
Brief introduction of the project.

## Research Summary
Short summary of the problem, your approach, your implementation, and results.

## Keywords
These are some key words or concepts related to the project (3 or 4 max).

## Data
In order to never face GitHub's size quotas, any data pertaining to the project should be hosted outside of the repository and linked in the README.

## Dependencies
You should always try to keep track of the dependencies of your project (e.g., Python packages) and their versions. That way anyone can re-create your development environment and reproduce your experiments.

Make sure to mention whether or not you used technologies like Docker, the required API keys for external services (if needed), the configuration files, and to provide Python's ```requirements``` file or the equivalent in other programming languages.

## Installation & Usage
You should provide instructions as to how to install and use your implementation.

## License
*We encourage you to use an open license and by default the repository contains an Apache License 2.0.*

# Internal structure of repositories

The simplest structure for the repository would be like the following

```
name_of_the_project
│  README.md   
│
└──code
│  │
│  └── ...
│   
└──report
   │
   └── ...
```

where the two main folders are:

| Folder       | Contents                     |
|--------------|------------------------------|
| ```code```   | your code and resources      |
| ```report``` | your report and presentations|

You can of course freely add other folders as you see fit. Make sure to properly name those and mention them in the README.

## Code
Please make a conscious effort in documenting your code (e.g., via comments).


## Student Project Report
Please consider using the official TU Delft Latex Report template [available here](https://d2k0ddhflgrk1i.cloudfront.net/Websections/TU%20Delft%20Huisstijl/report_style.zip).

# README Template

In this repo you can find a [template](template.md) for the README file to be used in your repo are expected to change over time so be sure to check back every once in a while to see if there's something useful to include in your documentation.

The template will be kept up-to-date with changes in the guidelines.

# Tips for newcomers

## Reference

README files are written in Markdown and you should get some familiarity with its syntax. You can use [this website](https://www.markdownguide.org) as reference.

## Editors

Here's some free Markdown editors you can use to write and preview Markdown files.

| Platform | Editor                                                   |                |
|----------|----------------------------------------------------------|----------------|
| Cross    | [VS Code](https://code.visualstudio.com) + [*Markdown All In One*](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)     | **Recommended**|
| Windows  | [Ghostwriter](https://wereturtle.github.io/ghostwriter/) |                |
| macOS    | [Typewriter](https://eightysix.github.io)                |                |
| Linux    | [Ghostwriter](https://wereturtle.github.io/ghostwriter/) |                |
| Web      | Directly on GitHub                                       |                |
