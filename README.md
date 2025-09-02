# Stratum: The Living Knowledge Platform

## Mission

Stratum is a next-generation B2B SaaS platform designed to transform how companies manage and disseminate internal knowledge. Our mission is to create a "living knowledge base" that dynamically adapts to a company's structure, ensuring that every employee has access to the right information at the right time.

## Overview

Stratum combines a powerful Learning Management System (LMS) with a context-aware Retrieval-Augmented Generation (RAG) AI. Key features include:

*   **Org Anatomy Engine:** A dynamic, drag-and-drop interface for modeling complex organizational hierarchies.
*   **Context-Aware AI:** An intelligent search and chat system that understands the user's role and provides answers based on relevant company documentation.
*   **Intuitive Content Creation:** Easy-to-use tools for building training modules, lessons, and quizzes.
*   **Collaborative Forums:** Department and role-specific forums to foster communication and knowledge sharing.
*   **Actionable Analytics:** Dashboards for administrators to track progress, engagement, and knowledge gaps.

This repository is a monorepo containing the source code for the frontend, backend, and AI services.

## Documentation

For a complete overview of the project, including business strategy, technical architecture, and user guides, please see the [documentation](./docs/).

uvicorn packages.backend.src.main:app
cd frontend
npm install
npm run dev