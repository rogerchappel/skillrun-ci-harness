# Security Policy

## Supported Versions

`skillrun-ci-harness` is pre-1.0. Security fixes target the latest commit on `main` and the next npm release candidate.

## Reporting

Please report public issues at https://github.com/rogerchappel/skillrun-ci-harness/issues. Do not include private fixtures, credentials, customer data, or unreleased connector payloads in public reports.

## Scope

This package reads local JSON fixtures and prints deterministic reports. It does not execute fixture commands, call external services, publish packages, or grant connector approvals.

Treat any fixture command labeled as write-like, external, or approval-sensitive as a separate workflow that requires explicit review before execution.
