# Traceability Matrix

## Purpose

This matrix links the original stakeholder requirements, functional requirements, and architecture requirements to the implemented repository components and the test plan.

## Reading Notes

- "Implementation" identifies the main files or subsystems responsible for the requirement.
- "Verification" points to the most relevant test-plan case IDs from `docs/test-plan.md`.
- Some requirements map to the same implementation because the MVP groups related behavior into one workflow.

## Stakeholder Requirements Matrix

| Requirement | Summary | Implementation | Verification |
|---|---|---|---|
| SR1 | Guide renters through housing-dispute paperwork | `frontend/src/pages/cases/NewCase.jsx`, `backend/src/services/caseService.js`, `backend/src/services/formRequirementService.js` | TP-05, TP-09 |
| SR2 | Ask simple guided questions | `frontend/src/pages/cases/NewCase.jsx`, `backend/src/services/formRequirementService.js` | TP-05, TP-09, TP-11 |
| SR3 | Help identify supported dispute categories | `backend/src/utils/validation.js`, `backend/src/services/filingPathRouterService.js` | TP-05, TP-09, TP-10 |
| SR4 | Use location and dispute type to determine form | `backend/src/services/filingPathRouterService.js` | TP-09, TP-10 |
| SR5 | Clearly report unsupported dispute/location combinations | `backend/src/services/formRequirementService.js`, `backend/src/services/formGenerationService.js` | TP-10 |
| SR6 | Pre-fill official forms from user input | `backend/src/services/formGenerationService.js`, `backend/src/services/pdfGenerationService.js` | TP-12 |
| SR7 | Show missing information before final generation | `backend/src/services/formRequirementService.js` | TP-09, TP-11 |
| SR8 | Let renter review/edit before final form creation | `backend/src/services/formAnswerService.js`, `backend/src/services/formRequirementService.js` | TP-11, TP-12 |
| SR9 | Help draft a clear dispute explanation | Requirement acknowledged, but renter-side drafting flow is not implemented in this repository | Covered as limitation |
| SR10 | Let renter download or print completed forms | `backend/src/services/generatedFormService.js`, `backend/src/controllers/formController.js` | TP-12 |
| SR11 | Save dispute case for later return | `backend/src/services/caseService.js`, MySQL schema | TP-05, TP-13 |
| SR12 | Let landlord view renter claim details for response | `backend/src/services/caseService.js`, landlord-auth access path | TP-04, TP-14 |
| SR13 | Let landlord submit their side of the dispute | `backend/src/services/landlordResponseService.js` | TP-14 |
| SR14 | Allow landlord response before arbitration | `backend/src/services/arbitrationService.js` | TP-15, TP-16 |
| SR15 | Consider landlord explanation and evidence in arbitration | `backend/src/services/arbitrationService.js`, `backend/src/services/arbitrationPromptService.js` | TP-14, TP-16 |
| SR16 | Provide neutral summary of both sides | `backend/src/services/arbitrationService.js` | TP-16 |
| SR17 | Identify missing evidence | `backend/src/services/arbitrationService.js` | TP-16 |
| SR18 | Identify disputed facts fairly | `backend/src/services/arbitrationService.js` | TP-16 |
| SR19 | Suggest a fair possible resolution | `backend/src/services/arbitrationService.js` | TP-16 |
| SR20 | Clearly state AI is not legal advice | `backend/src/services/arbitrationService.js`, `backend/src/services/formGenerationService.js` | TP-16 |
| SR21 | Protect case access | `backend/src/middleware/authMiddleware.js`, `backend/src/middleware/caseAccessMiddleware.js`, `backend/src/services/caseService.js` | TP-03, TP-18 |
| SR22 | Make requirements/architecture understandable to the team | `docs/*.docx`, `diagrams/architecture-diagram-v4.png`, this documentation set | Documentation review |

## Functional Requirements Matrix

| Requirement(s) | Summary | Implementation | Verification |
|---|---|---|---|
| FR1-FR2 | Start new case and record dispute type | `frontend/src/pages/cases/NewCase.jsx`, `backend/src/services/caseService.js`, `backend/src/utils/validation.js` | TP-05, TP-06 |
| FR3-FR8 | Use jurisdiction and rules to choose form path and required questions | `backend/src/services/filingPathRouterService.js`, `backend/src/services/formRequirementService.js`, `backend/src/config/legalFormCatalog.js` | TP-09, TP-10, TP-11 |
| FR9-FR14 | Validate renter, landlord, property, date, amount, and required fields | `backend/src/utils/validation.js` | TP-05, TP-06, TP-11 |
| FR15 | Store evidence descriptions with case | `backend/src/services/caseService.js` | TP-05, TP-13 |
| FR16-FR17 | Validate supported evidence uploads and reject unsupported ones | `backend/src/middleware/uploadMiddleware.js`, `backend/src/controllers/evidenceController.js` | TP-07, TP-08 |
| FR18-FR20 | AI drafting help for renter explanation | Not implemented in current repository | Covered as limitation |
| FR21-FR22 | Pre-fill supported official forms while preserving template structure | `backend/src/services/formGenerationService.js`, `backend/src/services/pdfGenerationService.js`, `backend/src/config/pdfFieldMappings.js` | TP-12 |
| FR23-FR24 | Detect missing form info and allow renter to revise answers | `backend/src/services/formRequirementService.js`, `backend/src/services/formAnswerService.js` | TP-09, TP-11 |
| FR25 | Allow renter to download/print completed document | `backend/src/controllers/formController.js`, `backend/src/services/generatedFormService.js` | TP-12 |
| FR26-FR27 | Save case details, template info, generated document reference, and status | `backend/src/services/caseService.js`, `backend/src/services/generatedFormService.js`, MySQL schema | TP-05, TP-12, TP-13 |
| FR28 | Safe handling for invalid or inaccessible cases | `backend/src/services/caseService.js`, error middleware | TP-18 |
| FR29-FR31 | Landlord response access method and invalid-access handling | Current MVP uses authenticated landlord email matching rather than a dedicated shareable case-link system | TP-04, TP-18 |
| FR32-FR33 | Validate and save landlord responses | `backend/src/utils/validation.js`, `backend/src/services/landlordResponseService.js` | TP-14 |
| FR34-FR36 | Start arbitration only when both sides and context exist, then send context to AI | `backend/src/services/arbitrationService.js`, `backend/src/services/arbitrationPromptService.js`, `backend/src/services/aiClientService.js` | TP-15, TP-16 |
| FR37 | Display and store neutral summary, claims, disputed facts, missing evidence, and suggested resolution | `backend/src/services/arbitrationService.js`, `backend/src/services/arbitrationResultService.js` | TP-16 |
| FR38-FR39 | Handle invalid or unavailable AI responses safely | `backend/src/services/arbitrationService.js`, AI config validation | TP-17 |
| FR40 | Include non-legal-advice disclaimer in arbitration output | `backend/src/services/arbitrationService.js` | TP-16 |
| FR41-FR42 | Save arbitration result and display it on completed case | `backend/src/services/arbitrationResultService.js`, `backend/src/services/caseService.js` | TP-16 |
| FR43-FR44 | Prevent unauthorized access and avoid exposing sensitive error detail | auth/access middleware and centralized error handling | TP-18 |
| FR45 | Support complete MVP demo flow | backend route/controller/service set as a whole | TP-05, TP-12, TP-14, TP-16 |

## Architecture Requirements Matrix

| Requirement | Summary | Implementation | Verification |
|---|---|---|---|
| AR1 | Separate frontend UI and backend logic | `frontend/` and `backend/` applications | TP-01 |
| AR2 | Provide views for intake, form review, case details, landlord response, arbitration | `frontend/src/pages/...` | UI-01 to UI-05 |
| AR3 | Expose separate endpoints/controllers for core workflows | `backend/src/routes/caseRoutes.js`, controllers in `backend/src/controllers/` | TP-01, TP-05, TP-12, TP-14, TP-16 |
| AR4 | Use validation layer before saving or generating | `backend/src/utils/validation.js` | TP-06, TP-11, TP-14 |
| AR5 | Use form-routing service for supported templates | `backend/src/services/filingPathRouterService.js` | TP-09, TP-10 |
| AR6 | Keep form routing rule-based, not AI-driven | `backend/src/services/filingPathRouterService.js` | TP-09, TP-10 |
| AR7 | Map validated answers into official templates | `backend/src/services/formGenerationService.js`, `backend/src/services/pdfGenerationService.js` | TP-12 |
| AR8 | Use AI integration layer for arbitration generation | `backend/src/services/aiClientService.js`, `backend/src/services/arbitrationService.js` | TP-16 |
| AR9 | Do not directly submit official forms to government agencies | Repository behavior and documented scope | TP-12, documentation review |
| AR10 | Store case data, template info, landlord responses, and AI results | `backend/src/services/caseService.js`, generated-form and arbitration services, MySQL schema | TP-05, TP-12, TP-14, TP-16 |
| AR11 | Persist cases, parties, form records, evidence metadata, and arbitration results | `backend/sql/schema.sql` | TP-05, TP-12, TP-14, TP-16 |
| AR12 | Store files on disk with DB references | upload middleware, generated-form service, evidence service | TP-07, TP-12 |
| AR13 | Protect case access using authentication/access controls | `authMiddleware.js`, `caseAccessMiddleware.js`, `caseService.js` | TP-03, TP-18 |
| AR14 | Handle unsupported templates, validation failures, invalid access, missing landlord responses, and AI failures explicitly | validation, form requirements, error handling, arbitration service | TP-06, TP-08, TP-10, TP-15, TP-17, TP-18 |
| AR15 | Support full renter-to-arbitration MVP flow | full backend workflow | TP-05, TP-12, TP-14, TP-16 |

## Requirement Gaps And Honest Exceptions

The following requirements are only partially met or deferred in the current repository:

| Requirement | Gap |
|---|---|
| AR2 full fidelity | Later frontend pages exist, but several still show placeholder/mock content instead of fully wired backend data |

## Conclusion

The repository demonstrates strong traceability for the main MVP backend workflow: renter intake, form routing, PDF generation, landlord response, and AI arbitration. The biggest traceability gaps are in the partially integrated frontend experience.
