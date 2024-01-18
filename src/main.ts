import * as core from '@actions/core'
import { initApplet } from '@zipper-inc/client-js'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const appletSlug: string = core.getInput('applet-slug')

    let filename: string = core.getInput('filename')
    filename = filename === '' ? 'main.ts' : filename

    const inputs: string = core.getInput('inputs')
    const inputsJSON = JSON.parse(inputs === '' ? '{}' : inputs)

    const awaitInput: string = core.getInput('await')
    const shouldAwait = awaitInput === 'true' || awaitInput === ''
    const zaat: string = core.getInput('zipper-access-token')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(
      `Running ${appletSlug}/${filename} with ${
        Object.keys(inputsJSON).length
      } inputs`
    )

    const zipperClient = initApplet(appletSlug, {
      token: zaat === '' ? undefined : zaat
    })

    const resPromise = zipperClient.path(filename).run

    if (shouldAwait) {
      const res = await resPromise(inputsJSON)
      core.setOutput('result', JSON.stringify(res))
    } else {
      resPromise(inputsJSON)
      core.setOutput('result', true)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
