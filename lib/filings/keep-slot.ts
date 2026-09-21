/**
 * Where a paragraph's HTML holds its Keep button. The server writes it into the
 * paragraph's last word and the reader puts the button there, so a waiting
 * button never sits on a line of its own.
 *
 * It lives apart from the reader's component because a server component cannot
 * read a value exported from a client component, only render the component.
 */
export const KEEP_SLOT = "<span data-keep-slot></span>";
