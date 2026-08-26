<?php

namespace Dpl\Sniffs\Hooks;

use PHP_CodeSniffer\Sniffs\Sniff;
use PHP_CodeSniffer\Files\File;

/**
 * Checks that procedural hook implementations have a corresponding OO hook.
 */
class NoProceduralHooksSniff implements Sniff
{
    /**
     * Cache of OO hook implementations found per module.
     *
     * @var array
     */
    private static $moduleOoHooksCache = [];

    /**
     * {@inheritdoc}
     */
    public function register()
    {
        return [T_FUNCTION];
    }

    /**
     * {@inheritdoc}
     */
    public function process(File $phpcsFile, $stackPtr)
    {
        $fileName = $phpcsFile->getFilename();

        // Only scan custom modules or profiles
        if (!preg_match('/\.(module|profile)$/', $fileName) || strpos($fileName, '/web/modules/custom/') === false) {
            return;
        }

        // Extract the module name and its directory
        if (preg_match('/\/web\/modules\/custom\/([^\/]+)\//', $fileName, $matches)) {
            $moduleName = $matches[1];
            $moduleDir = dirname($fileName);
        } else {
            return;
        }

        $tokens = $phpcsFile->getTokens();

        // Scan backwards to find the doc comment for this function
        $commentEnd = $phpcsFile->findPrevious(T_DOC_COMMENT_CLOSE_TAG, $stackPtr - 1);
        if ($commentEnd === false) {
          return;
        }

        // Ensure there are no other tokens except whitespace between the comment and function
        $belongsToThisFunction = true;
        for ($i = $commentEnd + 1; $i < $stackPtr; $i++) {
            if ($tokens[$i]['code'] !== T_WHITESPACE) {
                $belongsToThisFunction = false;
                break;
            }
        }

        if (!$belongsToThisFunction) {
            return;
        }

        $commentStart = $tokens[$commentEnd]['comment_opener'];
        $commentText = '';
        for ($i = $commentStart; $i <= $commentEnd; $i++) {
            $commentText .= $tokens[$i]['content'];
        }

        // Identify hook by the "Implements hook_..." docblock comment
        if (!preg_match('/Implements\s+hook_([a-zA-Z0-9_]+)/i', $commentText, $commentMatches)) {
            return;
        }

        $hookFromComment = strtolower($commentMatches[1]);

        // Also extract the hook name from the function name by stripping the module prefix (as fallback)
        $functionName = $phpcsFile->getDeclarationName($stackPtr);
        $hookFromFunction = '';
        if (strpos($functionName, $moduleName . '_') === 0) {
            $hookFromFunction = strtolower(substr($functionName, strlen($moduleName . '_')));
        }

        // Scan the module directory for OO hook implementations
        $ooHooks = self::getOoHooks($moduleDir);

        // If neither the comment hook name nor the function hook name has an OO counterpart, trigger an error
        $hasOoVersion = isset($ooHooks[$hookFromComment]) || ($hookFromFunction && isset($ooHooks[$hookFromFunction]));

        if (!$hasOoVersion) {
          $error = 'Legacy hook function "%s" without OO implementation found. Use a hook class for implementation, and use hook function for D10 support only.';
          $phpcsFile->addError($error, $stackPtr, 'NoOoHookFound', [$functionName]);
        }
    }

    /**
     * Recursively scans a module directory for files using the #[Hook] attribute.
     *
     * @param string $moduleDir
     *   The module directory.
     *
     * @return array
     *   An array where keys are lowercase hook names implemented in OO style.
     */
    private static function getOoHooks($moduleDir)
    {
        if (isset(self::$moduleOoHooksCache[$moduleDir])) {
            return self::$moduleOoHooksCache[$moduleDir];
        }

        $ooHooks = [];
        if (is_dir($moduleDir)) {
            try {
                $directory = new \RecursiveDirectoryIterator($moduleDir);
                $iterator = new \RecursiveIteratorIterator($directory);

                foreach ($iterator as $file) {
                    // Only scan PHP class/service files (excluding .module, .theme, etc.)
                    if ($file->isFile() && $file->getExtension() === 'php') {
                        $content = file_get_contents($file->getPathname());
                        if ($content === false) {
                            continue;
                        }

                        // Matches #[Hook('hook_name')] or #[\Drupal\Core\Hook\Attribute\Hook('hook_name')]
                        // Supports single/double quotes and named arguments e.g., value: 'hook_name'
                        if (preg_match_all('/#\[\s*(?:\\\\?Drupal\\\\Core\\\\Hook\\\\Attribute\\\\)?Hook\s*\(\s*(?:value\s*:\s*)?[\'"]([a-zA-Z0-9_]+)[\'"]/i', $content, $matches)) {
                            foreach ($matches[1] as $hook) {
                                $ooHooks[strtolower($hook)] = true;
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                // Fail gracefully if directory iteration fails
            }
        }

        self::$moduleOoHooksCache[$moduleDir] = $ooHooks;
        return $ooHooks;
    }
}
