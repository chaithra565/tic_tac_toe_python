export const pythonSourceCode = `# tic_tac_toe.py
"""
Tic-Tac-Toe (Two-Player Console Game)
A clean, beginner-friendly Python implementation structured with simple functions,
complete with input validation, board display, and reusable win-checking logic.
"""

def print_board(board):
    """
    Renders the current state of the 3x3 board cleanly inside the terminal.
    Positions are mapped as follows:
    [1] | [2] | [3]
    -----------
    [4] | [5] | [6]
    -----------
    [7] | [8] | [9]
    """
    print("\\n")
    print(f" {board[0]} | {board[1]} | {board[2]} ")
    print("-----------")
    print(f" {board[3]} | {board[4]} | {board[5]} ")
    print("-----------")
    print(f" {board[6]} | {board[7]} | {board[8]} ")
    print("\\n")

def check_win(board, player):
    """
    Checks all 8 possible winning combinations (3 rows, 3 columns, 2 diagonals)
    to determine if the specified player has won the game.
    """
    # Define winning index paths
    win_conditions = [
        # Rows
        (0, 1, 2), (3, 4, 5), (6, 7, 8),
        # Columns
        (0, 3, 6), (1, 4, 7), (2, 5, 8),
        # Diagonals
        (0, 4, 8), (2, 4, 6)
    ]
    
    for a, b, c in win_conditions:
        if board[a] == board[b] == board[c] == player:
            return True
    return False

def check_tie(board):
    """
    Checks if there are no remaining empty spots on the board.
    Assumes that check_win has already been verified.
    """
    # If there are no empty spots (represented by numbers 1-9), then it's a tie
    for spot in board:
        if isinstance(spot, int) or spot.isdigit():
            return False
    return True

def play_game():
    """
    Controls the main game loop, tracking player turns, coordinating inputs,
    and handling replay options.
    """
    print("===============================")
    print("    WELCOME TO TIC-TAC-TOE!    ")
    print("===============================")
    print("Two players will take turns.")
    print("Player 1 is 'X', Player 2 is 'O'.")
    print("Enter a position from 1 to 9 corresponding to the board layout:\\n")
    print(" 1 | 2 | 3 ")
    print("-----------")
    print(" 4 | 5 | 6 ")
    print("-----------")
    print(" 7 | 8 | 9 ")
    print("===============================\\n")

    while True:
        # Initialize a fresh 3x3 board where cells are labeled 1 to 9
        board = [str(i) for i in range(1, 10)]
        current_player = "X"
        game_active = True

        while game_active:
            print_board(board)
            print(f"Player '{current_player}' turn.")
            
            # Input validation loop
            while True:
                move_input = input("Choose a spot (1-9): ").strip()
                
                # Verify that input is a digit between 1 and 9
                if not (move_input.isdigit() and len(move_input) == 1 and '1' <= move_input <= '9'):
                    print("Error: Invalid entry. Please enter a single number from 1 to 9.")
                    continue
                
                position = int(move_input) - 1
                
                # Check if the chosen cell has already been occupied
                if board[position] in ["X", "O"]:
                    print(f"Error: Spot '{move_input}' is already occupied. Select another one.")
                else:
                    break  # Input is valid, exit the prompt loop

            # Execute move
            board[position] = current_player

            # Check if this move clinched a win
            if check_win(board, current_player):
                print_board(board)
                print("🎉 CONGRATULATIONS! 🎉")
                print(f"Player '{current_player}' has won the game!\\n")
                game_active = False
            # Check if the list is now filled (tie)
            elif check_tie(board):
                print_board(board)
                print("🤝 IT'S A TIE GAME! 🤝")
                print("All board positions are filled. Well played!\\n")
                game_active = False
            else:
                # Toggle turns to the other player
                current_player = "O" if current_player == "X" else "X"

        # Ask if they want to play again
        replay = input("Care for a rematch? (y/n): ").strip().lower()
        if replay not in ['y', 'yes']:
            print("\\nThank you for playing Tic-Tac-Toe! Goodbye.")
            break
        print("\\nResetting the board...")

if __name__ == "__main__":
    play_game()
`;
