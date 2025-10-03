import { Page, expect, test } from '@playwright/test';

/**
 * Interface for a task test case.
 */
interface TaskTestCase {
    readonly application: string;
    readonly column: string;
    readonly task: string;
    readonly tags: string[];
}

/**
 * A data set for the LoopQA Technical Evaluation tests.
 */
const taskTestCases: TaskTestCase[] = [
    { application: 'Web Application', column: 'To Do', task: 'Implement user authentication', tags: ['Feature', 'High Priority'] },
    { application: 'Web Application', column: 'To Do', task: 'Fix navigation bug', tags: ['Bug'] },
    { application: 'Web Application', column: 'In Progress', task: 'Design system updates', tags: ['Design'] },
    { application: 'Mobile Application', column: 'To Do', task: 'Push notification system', tags: ['Feature'] },
    { application: 'Mobile Application', column: 'In Progress', task: 'Offline mode', tags: ['Feature', 'High Priority'] },
    { application: 'Mobile Application', column: 'Done', task: 'App icon design', tags: ['Design'] }
];

/**
 * Logs in to the demo application.
 *
 * @param page The web page reference.
 * @param username The username.
 * @param password The password.
 */
const logIn = async (page: Page, username: string, password: string): Promise<void> => {
    await page.goto('');
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);
    await page.locator('button').click();
};

test.describe('LoopQA Technical Evaluation tests', () => {
    // Username and password should be stored in a .env file but for the purposes of this demo, the credentials will be hard-coded.
    const USERNAME = 'admin';
    const PASSWORD = 'password123';

    /**
     * For each test case, run test.
     * A test is successful if the expected column and task can be found and the task has the expected tags.
     * Further refinement could include moving the get task column and get task into methods for reusability.
     */
    for (const testCase of taskTestCases) {
        test(`Verify task: ${testCase.task}`, async ({ page }) => {
            await logIn(page, USERNAME, PASSWORD);

            // Select application.
            await page.getByRole('button', { name: testCase.application }).click();

            // Get the task column.
            const taskBoard = page.locator('.inline-flex');
            const columns = await taskBoard.locator('.bg-gray-50').all();
            let column = undefined;

            for (const c of columns) {
                const columnName = await c.locator('h2').textContent();

                // Column names include the total number of tasks, so use startsWith.
                if (columnName?.startsWith(testCase.column)) {
                    column = c;
                    break;
                }
            }

            // Verify the expected column was found.
            expect(column).toBeDefined();

            // Get the task.
            let task = undefined;

            if (column) {
                const tasks = await column.locator('.bg-white').all();

                for (const t of tasks) {
                    const taskName = await t.locator('h3').textContent();

                    if (taskName === testCase.task) {
                        task = t;
                        break;
                    }
                }

                // Verify the expected task was found.
                expect(task).toBeDefined();

                // Verify the task has the expected tags.
                if (task) {
                    const div = task.locator('div').first();
                    const tags = await div.locator('span').all();

                    expect(tags.length).toEqual(testCase.tags?.length);

                    for (const tag of tags) {
                        expect(testCase.tags).toContain(await tag.textContent());
                    }
                }
            }
        });
    }
});
