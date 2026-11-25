<?php

namespace Dpl\Sniffs\Hooks;

use PHP_CodeSniffer\Sniffs\Sniff;
use PHP_CodeSniffer\Files\File;

/**
 * Checks that no procedural hook implementations exist.
 *
 * Hooks should be implemented as OO hooks using the #[Hook] attribute.
 */
class NoProceduralHooksSniff implements Sniff
{
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

        $tokens = $phpcsFile->getTokens();

        // Scan backwards to find the doc comment for this function, skipping
        // whitespace and attributes. A #[LegacyHook] attribute marks the
        // function as a hook regardless of the doc comment.
        $commentEnd = null;
        $isLegacyHook = false;
        for ($i = $stackPtr - 1; $i >= 0; $i--) {
            if ($tokens[$i]['code'] === T_WHITESPACE) {
                continue;
            }

            if ($tokens[$i]['code'] === T_ATTRIBUTE_END) {
                $opener = $tokens[$i]['attribute_opener'];
                $attribute = $phpcsFile->getTokensAsString($opener, $i - $opener + 1);
                if (preg_match('/\bLegacyHook\b/', $attribute)) {
                    $isLegacyHook = true;
                }
                $i = $opener;
                continue;
            }

            if ($tokens[$i]['code'] === T_DOC_COMMENT_CLOSE_TAG) {
                $commentEnd = $i;
            }

            break;
        }

        if (!$isLegacyHook) {
            if ($commentEnd === null) {
                return;
            }

            $commentStart = $tokens[$commentEnd]['comment_opener'];
            $commentText = $phpcsFile->getTokensAsString($commentStart, $commentEnd - $commentStart + 1);

            // Identify hook by the "Implements hook_..." docblock comment
            if (!preg_match('/Implements\s+hook_[a-zA-Z0-9_]+/i', $commentText)) {
                return;
            }
        }

        $error = 'Procedural hook function "%s" found. Implement it as an OO hook using the #[Hook] attribute instead.';
        $phpcsFile->addError($error, $stackPtr, 'ProceduralHookFound', [$phpcsFile->getDeclarationName($stackPtr)]);
    }
}
