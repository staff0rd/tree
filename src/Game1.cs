using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace TreeGenerator
{
    public class Game1 : Microsoft.Xna.Framework.Game
    {
        GraphicsDeviceManager graphics;
        SpriteBatch spriteBatch;
        Camera Camera;
        Tree Tree;

        float prevMouseScroll;
        KeyboardState prevKbState;

        public Game1()
        {
            graphics = new GraphicsDeviceManager(this);
            Content.RootDirectory = "Content";
        }

        protected override void Initialize()
        {
            base.Initialize();
        }

        protected override void LoadContent()
        {
            spriteBatch = new SpriteBatch(GraphicsDevice);
            Camera = new Camera(graphics.GraphicsDevice.Viewport, 2);
            Camera.Move(new Vector2(0, -110));
            Tree = new Tree(Vector2.Zero, GraphicsDevice, Content);
        }

        protected override void UnloadContent()
        {
        }

        protected override void Update(GameTime gameTime)
        {
            KeyboardState kbState = Keyboard.GetState();
            MouseState mouseState = Mouse.GetState();

            //Camera Move
            if (kbState.IsKeyDown(Keys.I))
                Camera.Move(new Vector2(0, -1));
            else if (kbState.IsKeyDown(Keys.K))
                Camera.Move(new Vector2(0, 1));
            if (kbState.IsKeyDown(Keys.J))
                Camera.Move(new Vector2(-1, 0));
            else if (kbState.IsKeyDown(Keys.L))
                Camera.Move(new Vector2(1, 0));

            //Camera Zoom
            if (mouseState.ScrollWheelValue != prevMouseScroll)
            {
                if (prevMouseScroll > mouseState.ScrollWheelValue)
                    Camera.Zoom += 0.15f;
                else if (prevMouseScroll < mouseState.ScrollWheelValue)
                    Camera.Zoom -= 0.15f;
            }
            prevMouseScroll = mouseState.ScrollWheelValue;

            //New random tree
            if (kbState.IsKeyDown(Keys.P) && prevKbState.IsKeyUp(Keys.P))
            {
                Tree = new Tree(Vector2.Zero, GraphicsDevice,  Content);
            }

            //Grow tree 1 iteration
            if (kbState.IsKeyDown(Keys.Space) && prevKbState.IsKeyUp(Keys.Space))
            {
                Tree.Grow();
            }

            prevKbState = kbState;

            base.Update(gameTime);
            
        }

        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(Color.CornflowerBlue);

            Tree.Draw(spriteBatch, Camera);

            base.Draw(gameTime);
        }
    }
}
