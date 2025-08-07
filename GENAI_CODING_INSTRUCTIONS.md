# GenAI Coding Instructions: KISS Principle

## Core Philosophy: Keep It Simple, Stupid (KISS)

### Primary Rules

1. **ALWAYS follow the provided designs exactly**
   - Do not add features, components, or functionality not shown in designs
   - Do not modify layouts, spacing, or visual elements unless explicitly requested
   - Stick to the specified color schemes, typography, and UI patterns

2. **ALWAYS ask for clarification when information is missing**
   - If a design shows a component but doesn't specify behavior, ask
   - If implementation details are unclear, ask before assuming
   - If you think something might be needed but isn't specified, ask first
   - Never implement "nice to have" features without explicit request

3. **Simplicity over complexity**
   - Choose the simplest solution that meets the requirements
   - Avoid over-engineering or premature optimization
   - Use existing patterns and components before creating new ones
   - Prefer readable code over "clever" code

## Implementation Guidelines

### Code Structure
- **Single Responsibility**: Each function/component should do one thing well
- **Minimal Dependencies**: Only import what you actually use
- **Clear Naming**: Use descriptive names that explain purpose, not implementation
- **No Magic Numbers**: Use named constants for any hardcoded values

### Vue/TypeScript Specific
- Use Composition API consistently
- Leverage existing Pinia stores rather than creating new state management
- Follow the established project patterns for:
  - Component structure
  - Type definitions
  - Store organization
  - Styling approach

### When to Ask for Clarification

#### Required Clarifications
- **Missing behavior specifications**: "The design shows a button, but what should happen when clicked?"
- **Unclear data relationships**: "How should this component receive its data?"
- **Validation requirements**: "What validation rules should apply to this form field?"
- **Error handling**: "How should errors be displayed to the user?"
- **State management**: "Should this data persist across page reloads?"

#### Forbidden Assumptions
- Don't assume loading states are needed unless shown
- Don't assume error handling patterns unless specified
- Don't assume accessibility features beyond basic semantic HTML
- Don't assume responsive breakpoints unless provided
- Don't assume animation/transition requirements

### Decision Making Process

1. **Read the requirement completely**
2. **Check existing codebase for similar patterns**
3. **Identify what's explicitly specified vs. what's assumed**
4. **If anything is assumed, ask for clarification**
5. **Implement the simplest solution that meets explicit requirements**
6. **Test against the provided design/specification**

### Communication Templates

#### When Asking for Clarification
```
I need clarification on [specific aspect]. The design shows [what's visible] but doesn't specify [missing information]. 

Options I see:
1. [Simple option A]
2. [Simple option B]

Which approach would you prefer, or should I implement something different?
```

#### When Suggesting Simplification
```
I can implement this requirement in a simpler way by [explanation]. 
This would:
- Reduce complexity by [specific benefit]
- Maintain the same user experience
- Follow the existing codebase patterns

Would this approach work for your needs?
```

### Code Review Checklist

Before submitting any code, verify:

- [ ] Does this exactly match the provided design?
- [ ] Did I add anything not explicitly requested?
- [ ] Is this the simplest solution that works?
- [ ] Did I ask for clarification on unclear requirements?
- [ ] Does this follow existing project patterns?
- [ ] Are there any assumptions I made that I should have asked about?

### Anti-Patterns to Avoid

#### Over-Engineering
- ❌ Creating reusable components for one-time use
- ❌ Adding configuration options not requested
- ❌ Implementing features "for future use"
- ❌ Complex state management for simple data

#### Assumption-Driven Development
- ❌ "This probably needs error handling"
- ❌ "Users will want to sort/filter this"
- ❌ "This should be responsive"
- ❌ "We'll need loading states"

#### Design Deviations
- ❌ "This would look better if..."
- ❌ "Let me add some spacing here"
- ❌ "Users expect this behavior"
- ❌ "This is a common pattern"

### Example Interactions

#### Good: Asking for Clarification
**Human**: "Add a user list component"
**GenAI**: "I need clarification on the user list component:
1. What data should be displayed for each user?
2. Should users be clickable/interactive?
3. How should the list be styled (table, cards, simple list)?
4. Are there any specific ordering requirements?"

#### Bad: Making Assumptions
**Human**: "Add a user list component"
**GenAI**: "I'll create a user list with avatar images, search functionality, sorting options, and pagination since these are common patterns..."

### Testing Approach

- Test only what's specified in requirements
- Use the simplest testing approach that verifies functionality
- Don't test implementation details
- Focus on user-facing behavior

### Documentation

- Document only what's not obvious from the code
- Explain "why" decisions were made when non-obvious
- Keep comments minimal and focused
- Update existing documentation rather than creating new docs

## Summary

The key to successful GenAI coding is restraint:
- **Implement exactly what's asked for**
- **Ask when unclear**
- **Choose simple over complex**
- **Follow existing patterns**
- **Don't add unrequested features**

Remember: It's better to implement 100% of the requested features simply than 150% of assumed features complexly.
