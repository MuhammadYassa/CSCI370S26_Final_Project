# Sprint Summary

## Project Information

**Team Name:** Muhammad's Group  
**Project Name:** Renter Dispute Assistant  
**GitHub Repository:** https://github.com/MuhammadYassa/CSCI370S26_Final_Project  
**Jira Board:** https://csci370s26.atlassian.net/jira/software/projects/FPS/boards/34  

## Sprint Information

**Sprint Name:** FPS Sprint 1  
**Sprint Start Date:** May 14, 2026  
**Sprint End Date:** May 19, 2026  
**Project Due Date:** May 23, 2026 at 11:59 PM  
**Showcase Demo:** May 19, 2026, 8:30 AM – 10:30 AM  

## Sprint Goal

The goal of FPS Sprint 1 was to build the minimum working version of the Renter Dispute Assistant application. The MVP needed to allow a renter to enter dispute information, allow the backend to determine the correct official form or document type based on the dispute, generate and store renter form data, allow both the renter and landlord sides to be saved for a dispute case, and send both sides to an AI API for a neutral arbitration summary and suggested resolution.

## Team Roles

| Team Member | Role | Main Responsibility | Estimated Hours |
|---|---|---|---|
| Muhammad | Backend Developer | Backend API, MySQL schema, authentication, evidence upload, official PDF generation, landlord response, and AI arbitration | 30 hours |
| Md Ismail | Frontend Developer | Frontend UI, frontend API integration, renter/landlord user flows, dashboard, form, evidence, and arbitration screens | TBD |
| Hridi | Deployment / Infrastructure | Deployment setup, infrastructure, configuration, environment setup, and deployment testing | TBD |

## Sprint Scope

This sprint covered the full MVP implementation of the project. The work was divided into backend, frontend, deployment/infrastructure, testing, and documentation responsibilities.

The backend portion was organized around three major Jira tickets:

| Ticket | Summary | Result |
|---|---|---|
| Ticket 1 | Implement Dispute Case Intake, Storage, Retrieval, Authentication, and Evidence Upload | Completed |
| Ticket 2 | Implement Official Form Selection, Official Filing Path Detection, Missing Information Collection, and Generated Form/PDF Service | Completed |
| Ticket 3 | Implement Landlord Response and AI Arbitration API Flow | Completed |

Additional project work included frontend authentication screens, case dashboard, evidence upload screens, form generation integration, landlord response flow, AI arbitration display, deployment/infrastructure setup, testing, and final documentation.

## Completed Work

### Backend

- Implemented JWT authentication for renters and landlords.
- Implemented protected case creation, case listing, and single-case retrieval.
- Implemented MySQL schema and migrations.
- Implemented renter evidence image upload and protected evidence retrieval.
- Implemented landlord evidence upload using the same protected evidence system.
- Implemented official filing path detection for supported New York and New York City renter disputes.
- Implemented missing information detection for official forms.
- Implemented saved guided form answers.
- Implemented official PDF generation for supported filing paths.
- Implemented generated PDF storage and protected PDF download.
- Implemented landlord response submission and retrieval.
- Implemented Gemini AI arbitration using renter and landlord case data.
- Implemented AI image evidence analysis using uploaded renter and landlord evidence images.
- Implemented saved arbitration result retrieval.

### Frontend

- Implemented authentication frontend flow.
- Implemented renter dashboard.
- Implemented dispute case creation flow.
- Implemented evidence upload frontend flow.
- Implemented generated form frontend integration.
- Implemented landlord response frontend handling.
- Implemented AI arbitration frontend display.
- Improved frontend handling, document preview, and user experience.

### Deployment / Infrastructure

- Deployment and infrastructure work was started and remained in progress at the end of the sprint.
- Environment setup, configuration, and deployment process documentation were included as part of final project preparation.

### Testing and Documentation

- Backend testing was completed.
- Authentication, case creation, evidence upload, form generation, landlord response, and AI arbitration were tested.
- Tests done and test result PDFs were prepared for completed Jira tickets.
- Requirements, documentation, user guide, deployment guide, configuration guide, test plan, traceability matrix, and limitations documentation were prepared for final submission.

### Done

- Create GitHub repository and project folder structure.
- Upload requirements to GitHub and Jira.
- Implement Dispute Case Intake, Storage, and Retrieval.
- Implement Official Form Selection and Generated Form Data Service.
- Implement Landlord Response and AI Arbitration API Flow.
- Implement Frontend-Backend Integration and Testing.

### Review Approved

- Implement Dashboard, Evidence Upload, and AI Result Frontend UI.
- Implement Frontend Integration, Document Preview, and User Experience Enhancements.
- Implement Authentication and Dispute Intake Frontend Flow.

### Review in Progress

- Implement Evidence Upload and AI Workflow Testing.
- Fix frontend-admitted issue.

### In Progress

- Implement Deployment and Final QA Process.

## Sprint Outcome

The sprint successfully produced a working MVP of the Renter Dispute Assistant system. The completed MVP includes backend and frontend functionality for renter case creation, evidence upload, official form generation, landlord response, landlord evidence upload, and Gemini AI arbitration.

The backend API, frontend, MySQL schema, official PDF generation, AI arbitration, documentation, and backend testing were completed. Deployment was not fully completed by the end of this sprint and remained in progress.

## Deliverables Completed During Sprint

| Deliverable | Status |
|---|---|
| Backend API | Completed |
| Frontend MVP | Completed |
| MySQL Schema | Completed |
| Official PDF Generation | Completed |
| AI Arbitration | Completed |
| Backend Testing | Completed |
| Documentation | Completed |
| Deployment | In Progress |

## Final Sprint Status

**Sprint Result:** MVP completed, with deployment still in progress.  
**Overall Status:** Ready for final review, continued deployment work, and final project packaging.
