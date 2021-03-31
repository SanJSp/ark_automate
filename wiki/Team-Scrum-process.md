## Our current Scrum process is the following:

### General
- One sprint is usually three weeks long.
- The teams' core work time is Monday-Wednesday (9 am-3 pm) and a fourth flexible day that each team member can set himself
- Each member of the team works about 32 hours per week

### Meetings

**1. Daily Scrum:**
Limited to 15 min the daily scrum takes place Monday, Tuesday and Wednesday at 9 am in MS Teams.
Only the core team is participating including Maximilian.
The structure the team agreed on is that every team member shortly answers the following three questions:
* What did I do yesterday that helped the Development Team achieve the sprint goal?
* What will I do today to help the Development Team achieve the sprint goal?
* Do I see any obstacle that will prevent me or the Development Team from achieving the Sprint Goal?

**2. Sprint Planning:**
It usually takes place on the first day of the new sprint. It should never exceed 4 hours.
Only the core team is participating including Maximilian. The Scrum Master is inviting everyone. The goal is to define a sprint backlog and a sprint goal as well as the responsibilities for the different issues. We estimate the effort of the stories using Planning Poker. We decided to use the Fibonacci scale at the beginning of the 6th sprint. One story point corresponds to 2 man-hours.

**3. Sprint Review:**
It usually takes place on the last day of the sprint. It takes about 1 hour.
The core team is participating as well as important Stakeholders like Prof. Weske, Tobias Metzke-Bernstein, Simon Siegert, Maximilian Völker. The Product Owner takes care of the invitations.
First, the Product Owner presents which stories of the backlog were done and the Development Team shows the product increment and explains what went well and what challenges they faced. Second, the stakeholders give feedback on the product increment and give valuable input for the next sprint.

**4. Sprint Retrospective:**
It takes place directly 0.5 hours after the sprint review. It should not exceed 1.5 hours. Only the core team is participating.
The Scrum Master is inviting everyone. The goal is to reflect on the last sprint and find ways to improve the scrum process as well as the way the team works together. The Scrum Master informs Maximilian about any changes to the process and updates this wiki.

### Artefacts
All the relevant scrum artifacts are stored here in this GitHub project.

**Product Increment:**
* The current product increment can be found on the master branch. It is updated before every sprint review.

**Product Backlog & Sprint Backlog:**
* Can be found in the "Projects" tab under "Kanban Board".
* For every user story, the definition of done is defined under the point "Conditions of satisfaction".
* New ideas for user stories can be sent to the product owner directly or an issue can be created in the column "User Story Ideas / Bug Reporting" 


### Agreements

We agreed on having a **Pull Request freeze on 14:00** the day before the sprint review. This means, that no further Pull Requests may be created until then, if the changes are supposed to be merged for the current sprint goal. The same day **at 18:00 we agreed on a merge freeze**, which means no further pull requests from feature branches are to be merged into dev for the release presented at the sprint review the next day. User stories that are merged after 18:00 will be presented at the next sprint review.

### Action Points for this Sprint

During our last retrospective we agreed on tackling the following action points:
* Pull Requests that introduce more than 500 lines of changes need a more detailed description so that reviewers can understand the components, not only check for syntax.
* Work on spike issues is supposed to be stopped as soon as the estimated time has passed
* We want to figure out ways to find a balance between time spent on our bachelors project and the bachelors thesis. Other bachelor project teams are allowed to reserve time in their sprint for their Bachelors thesis. Further interrogation is needed to check if we are allowed to do this as well.
* We need to define our programming style for issues, wether it's closer to extreme programming or more future proof implementations